import { KeyedSet } from "@/common"
import { NetworkEvent, Relay, Client, Session } from "@/network"
import { Authority, Reconciler, Snapshot } from "../netcode"
import Actant from "@/system/Actant"
import Area from "@/system/Area"
import Backstage from "@/system/Backstage"
import Spectator from "@/system/Spectator"


class Stage {
    #_spectators: KeyedSet<Spectator> = new KeyedSet(spectator => spectator.id)
    #_backstage: Backstage = new Backstage()
    #_area: Area = new Area(this.#_backstage)
    #_reconciler: Reconciler = new Reconciler(this.#_backstage)
    #_network: Relay<Snapshot> | Client<Snapshot> | undefined
    #_state = {
        initialized: false
    }

    get spectators() {
        return this.#_spectators
    }

    get backstage() {
        return this.#_backstage
    }

    get network() {
        return this.#_network
    }

    cast(...constructors: typeof Actant[]): this {
        for (const constructor of constructors) {
            this.#_backstage.roles.add(constructor)
        }
        return this
    }

    projectedTo(spectator: typeof Spectator, verifiedBy?: typeof Authority): this {
        this.#_joinSpectator = (session) => {
            return new spectator(session, new (verifiedBy ?? Authority)(this.#_backstage))
        }
        return this
    }

    networkingVia(network: Relay | Client): this {
        this.#_network = network
        return this
    }

    update(_dt: number): this {
        if (!this.#_state.initialized) {
            this.#_prepare()
            return this
        }
        for (const spectator of this.#_spectators) {
            for (const actor of spectator.spotlightActors(this.#_area)) {
                spectator.update(actor)
            }
        }
        return this
    }

    readonly #_prepare = () => {
        if (this.#_network) {
            this.#_network.on(NetworkEvent.CONNECT, ({ session }) => {
                const spectator = this.#_joinSpectator(session)
                this.spectators.add(spectator)
            })
            this.#_network.on(NetworkEvent.MESSAGE, ({ session, message }) => {
                const spectator = this.#_spectators.get(session.id)
                if (spectator) {
                    spectator.process(message)
                    this.#_reconciler.reconcile(message)
                }
            })
            this.#_network.on(NetworkEvent.CLOSE, ({ session }) => {
                const spectator = this.spectators.get(session.id)
                if (spectator) {
                    this.spectators.delete(spectator)
                }
            })
        }
        this.#_state.initialized = true
    }

    #_joinSpectator = (session: Session): Spectator => {
        return new Spectator(session, new Authority(this.#_backstage))
    }
}


export default Stage
