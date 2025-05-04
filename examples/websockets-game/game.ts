import { Stage, Prop, Spectator, Actor } from "stageplay/system"

// @ts-ignore
// import { Actor, Prop, Spectator, Stage } from "stageplay/system"


export class Position extends Prop {
    public x: number = 0
    public y: number = 0
}

export class Velocity extends Prop {
    public x: number = 0
    public y: number = 0
}

export class Owned extends Prop {
    public owned: boolean = false
}

export class Goblin extends Actor {
    position = new Position()
    velocity = new Velocity()
    owned = new Owned()
}


export const stageServer = new Stage()
    .projectedTo(Spectator)
    .cast(Goblin, Position, Velocity)

export const stageBrowser = new Stage()
    .projectedTo(Spectator)
    .cast(Goblin, Position, Velocity)