# Updating the message hat block (duplicate var problem)
- leaving an upvar behind
    - on first load:
        - msgFields: question, answer, difficulty
        - msgContent: []
        - input: MessageOutputSlotMorph

    - on second load:
        - msgFields: msg
        - msgContent: [3]
        - input: difficulty

    - on failed load:
        - msgFields: question, answer, difficulty
        - msgContent: [1]
        - input: doSocketMessage

    - the order is wrong - the CommandBlockMorph should not be between the MOSM and the ROTSM

## Refactor stuff
- MessageInputSlotMorph should not edit siblings
    - what children does it need?
        - messagetype
        - fields

    - what methods does it need?
        - setContents
        - the drawing one... drawNew
