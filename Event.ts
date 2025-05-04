import NetworkEvent from "@/network/NetworkEvent"


type Event =
    | NetworkEvent

const Event = {
    ...NetworkEvent
}


export default Event