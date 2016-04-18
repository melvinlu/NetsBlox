# Export entire room
- Export:
    Schema:
        <room name="NAME" app="APP_NAME">
            <role name="ROLE_NAME">
                <project/>
            </role>
            <role name="ROLE_NAME">
                <project/>
            </role>
            ...
        </room>

    Server:
        - Create a new endpoint to retrieve the code from each role
            - receive: "export-roles"
            - respond: "export-roles" {role1: data, role2: data, ...}

    Client:
        - send "export-roles"
        - receive "export-roles" { ... }
            - create the rest of the xml
                - add the app name and room name

- Import:
    Server:
        - Create a new endpoint for importing a project (ws)
            - "import-room": { role: data, role2: data2 ... }
            - response is "room-roles" after the seats are changed

    Client:
        - Open a new project w/ given name
        - send the roles over ws to the server
            - "import-room": { role: data, role2: data2 ... }

- Release v0.5.0 after this is implemented

- I need to make sure the imported room doesn't collide with any of the user's other rooms

- socket is not in the room...
    - 

- cachedProjects should not store the weird json stuff
    - seems to be working so far....

- room is not in the rooms dictionary any more!
    - It seems to be removing itself...
    - role name matches...

    - events:
        - create-room 'Room 38', r2
        - myRole => r2
        - rm myRoom
        - room-roles
        - rename-role 'myRole' => 'r2' --- problem?
        - removing 'Room 38'
        - rename 'Room 38'
    - FIXED... not very happy with the fix though :/
