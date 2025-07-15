import { EventEmitter } from "events"
import { Socket, Server } from "net"
import { SmartBuffer } from "../smart-buffer/typings/smartbuffer"

declare global {
    /**@global */
    const Game: GameClass

    /**
     * @global
     * Shortcut to {@link Game.world}
     * */
    const world: World

    const AssetDownloader: AssetDownloaderClass

    /** @global
     * Will eventually contain handy functions. But for now only contains randomHexColor().
     */
    const util: Utilities

    const Sanction: SanctionClass

    /**
     * A promisified version of setTimeout, useful for writing timeouts syncronously.
     * @global
     * @example
     * ```js
     * Game.on("playerJoin", async(player) => {
     *  player.message("After 5 seconds, you're gone!")
     *  await sleep(5000)
     *  player.kick("Time's up!")
     * })
     */
    const sleep: (ms: number) => Promise<void>

    /**
     * Used for locking functions until a specified time has passed.
     * @global
     * @example
     * ```js
     * Game.on("playerJoin", (player) => {
     *    player.on("mouseclick", debounce(() => {
     *        console.log("You clicked! But now you can't for 5 seconds.")
     *    }, 5000))
     * })
     * ```
     */
    const debounce: <Args extends any[]>(callback: (...args: Args) => void, delay: number) => (...args: Args) => void

    /**
     * Used for locking functions for a player until a specified time has passed.
     * @global
     * @example
     * ```js
     * let brick = world.bricks.find(b => b.name === "teleporter")
     * 
     * brick.touching(debouncePlayer(p => {
     *  p.setPosition(brick.position)
     * }, 5000))
     * ```
     */
    const debouncePlayer: <T extends Player, Args extends any[]>(callback: (player: T, ...args: Args) => void, delay: number) => (player: T, ...args: Args) => void

    /**Modules in start.js are built in host (outside of the vm). It is highly recommended to use this function
     * to require them in a VM context. If you opt to use require() instead, you may have issues.
     * @example
     * Example:
     * ```js
     * // Inside of start.js: modules: ["discord.js", "fs"]
     * 
     * // Now inside of a sample script:
     * 
     * // You can now use discord.js
     * let discord = getModule("discord.js")
     * 
     * // Login to a discord account, etc.
     * discord.login("myToken")
     * ```
     */
    const getModule: (module: string) => NodeModule

    //Enums

    const enum CameraType {
        /**The camera is fixed in place. You can set the position of it. */
        Fixed = "fixed",
        /**The camera is orbiting the cameraObject (a player). You cannot set the position of it. */
        Orbit = "orbit",
        /**The camera is free-floating, the player can move it with WASD. (Glitchy and really bad). */
        Free = "free",
        /**The player's camera is locked in first person. */
        First = "first",
    }

    const enum Client {
        /**The original client made by Luke */
        Classic = 0,
        /**Brickplayer by Ty */
        BrickPlayer = 1,
        /**Player2 by Ezcha */
        Player2 = 2,
    }

    const enum GameEvents {
        /**Triggered after player loads everything
         * 
         * Listener:
         * ```js
         * (player: Player) => {...}
         * ```
         */
        InitialSpawn = "initialSpawn",
        /**Triggered when player just joins the game(before anything is even loaded)
         * 
         * Listener:
         * ```js
         * (player: Player) => {...}
         * ```
         */
        PlayerJoin = "playerJoin",
        /**Triggered when player leaves
         * 
         * Listener:
         * ```js
         * (player: Player) => {...}
         * ```
         */
        PlayerLeave = "playerLeave",
        /**Triggered when player chats in the game.
         * 
         * Listener:
         * ```js
         * (player: Player) => {...}
         * ```
         */
        Chatted = "chatted",
        /**If a Game.on("chat") listener is added, any time the game recieves a chat message, it will be emitted data to this listener, and the actual packet for sending the chat will not be sent.
         *
         * You can use this to intercept chat messages, and then transform them to whatever, and then call Game.messageAll.
         * 
         * Listener:
         * ```js
         * (player: Player, message: string) => {...}
         * ```
         */
        Chat = "chat",
        /**Triggered when the scripts finish loading.
         * 
         * Listener:
         * ```js
         * () => {...}
         * ```
         */
        ScriptsLoaded = "scriptsLoaded",
        /**Triggered when Game.setData is populated after the initial server post. You should use Game.setDataLoaded() instead of using a listener.
         * 
         * Listener:
         * ```js
         * () => {...}
         * ```
         * 
         * The proper way:
         * ```js
         * Game.setDataLoaded().then(() => {...})
         * ```
         */
        SetDataLoaded = "setDataLoaded",
        /**Triggered when receives a new packet
         * 
         * Listener:
         * ```js
         * (packetData: PacketData) => {...}
         * ```
         */
        NewPacket = "newPacket",
    }

    const enum KeyTypes {
        Alphabetical = "a-z",
        Numerical = "0-9",
        Shift = "shift",
        Lshift = "lshift",
        Rshift = "rshift",
        Control = "control",
        Lcontrol = "lcontrol",
        Rcontrol = "rcontrol",
        Alt = "alt",
        Ralt = "ralt",
        Lalt = "lalt",
        Tab = "tab",
        Space = "space",
        Return = "return",
        Enter = "enter",
        Backspace = "backspace",
        Mouse1 = "mouse1",
        Mouse2 = "mouse2",
        Mouse3 = "mouse3",
        Up = "up",
        Down = "down",
        Left = "left",
        Right = "right",
    }

    const enum PacketEnums {
        Authentication = 1,



        SendPlayers = 3,

        Figure = 4,

        RemovePlayer = 5,

        Chat = 6,

        PlayerModification = 7,

        Kill = 8,

        Brick = 9,

        Team = 10,

        Tool = 11,

        Bot = 12,



        ClearMap = 14,

        DestroyBot = 15,

        DeleteBrick = 16,

        SendBrick = 17,

        AddKeypress = 21,

        SoundEmitter = 22,

        SendSoundEmitters = 23,
    }

    const enum PlayerEvents {
        /**Triggered once player fully loads (identical to ```GameEvents.InitialSpawn```)
         * 
         * Listener:
         * ```js
         * () => {...}
         * ```
         */
        InitialSpawn = "initialSpawn",
        /**Triggered when player dies (health is less or equals 0)
         * 
         * Listener:
         * ```js
         * () => {...}
         * ```
         */
        Died = "died",
        /**Triggered when player respawns
         * 
         * Listener:
         * ```js
         * () => {...}
         * ```
         */
        Respawn = "respawn",
        /**Triggered when player avatar loads
         * 
         * Listener:
         * ```js
         * () => {...}
         * ```
         */
        AvatarLoaded = "avatarLoaded",
        /**Triggered when player chats. Functionality-wise this behaves like ```GameEvents.Chatted```.
         * 
         * Listener:
         * ```js
         * (message: string) => {...}
         * ```
         */
        Chatted = "chatted",
        /**Triggered when player moves.
         * 
         * Listener:
         * ```js
         * (newPosition: Vector3, newRotation: Vector3) => {...}
         * ```
         */
        Moved = "moved",
    }

    const enum ToolEvents {
        /**Triggered when player clicks LMB with tool equiped.
         * 
         * Listener:
         * ```js
         * (player: Player) => {...}
         * ```
         */
        Activated = "activated",
        /**Triggered when player equips the tool.
         * 
         * Listener:
         * ```js
         * (player: Player) => {...}
         * ```
         */
        Equipped = "equipped",
        /**Triggered when player unequips the tool.
         * 
         * Listener:
         * ```js
         * (player: Player) => {...}
         * ```
         */
        Unequipped = "unequipped",
    }

    const enum Weather {
        Sun = "sun",
        Rain = "rain",
        Snow = "snow",
    }

    //Interfaces

    interface AssetData {
        mesh: string
        texture: string
        sound: string
    }

    interface Assets {
        tool: number
        face: number
        hat1: number
        hat2: number
        hat3: number
        clothing1: number,
        clothing2: number,
        clothing3: number,
        clothing4: number,
        clothing5: number,
    }

    interface BodyColors {
        head: string
        leftArm: string
        leftLeg: string
        rightArm: string
        rightLeg: string
        torso: string
    }

    interface ClientSocket extends Socket {
        _attemptedAuthentication: boolean
        _kickInProcess: boolean
        player: Player
        IPV4: string
        IP: string
        keepalive: {
            timer: NodeJS.Timeout | null
            keepAliveTime: number
            kickIdlePlayer: () => void
            restartTimer: () => void
        },
        _chunk: {
            recieve: Buffer
            remaining: number
            clear: () => void
        }
    }

    interface Disconnectable {
        /** Stops the event listener. */
        disconnect: () => void
    }

    interface Environment {
        ambient: string,
        skyColor: string,
        baseColor: string,
        baseSize: number,
        sunIntensity: number,
        weather: Weather,
    }

    interface GameSettings {
        /**The id of the Brick Hill set. */
        gameId?: number,

        /**The host key of the Brick Hill set. */
        hostKey: string,

        /**Whether or not the server will be posted to the games page. */
        postServer?: boolean,

        /**IP to bind the server to (Default 127.0.0.1 on local, 0.0.0.0 otherwise) */
        ip?: string,

        /**The port the server will be running on. (Default is 42480).*/
        port: number,

        /** The name of the brk file to be hosted. (ex: `hello.brk`) */
        map?: string,

        /**The file path to server's map folder. */
        mapDirectory?: string,

        /**An array containing the names of core scripts you do not want to run. \
         * For ex: `["admin.js"]`
         * 
         * You can use `["*"]` to disable ALL core scripts.
         * 
         * @default true
        */
        disabledCoreScripts?: Array<string>,

        /**
         * An array containing the names of npm modules / core node.js modules you want to compile from host, and use inside the VM context.
         * 
         * You can require them with {@link getModule}
         */
        modules?: Array<string>,

        /**A link to your scripts directory. ex: (`/myfolder/user_scripts`) */
        scripts?: string,

        cli?: boolean,

        /**A boolean indicating if the server is locally hosted or not. Uses port 42480 by default. \
         * Port forwarding is not required
         * @default false
        */
        local: boolean,

        /**If enabled, all files (even inside of folders) in user_scripts will be loaded recursively */
        recursiveLoading?: boolean
    }

    interface MapData {
        bricks: Array<Brick>,
        spawns: Array<Brick>,
        environment: Environment,
        tools: Array<Tool>,
        teams: Array<Team>,
    }

    interface SetData {
        id: number,
        creator: {
            id: number,
            username: string,
            avatar_hash: string
        },
        name: string,
        description: string,
        playing: number,
        visits: number,
        created_at: string,
        updated_at: string,
        thumbnail: string | null,
        genre: {
            id: number,
            type: string
        }
    }

    interface PacketBuilderOptions {
        compression?: boolean
    }

    interface Utilities {
        filter: {
            getFilter: () => string[]
            setFilter: (filter: string[]) => void
            isSwear: (input: string) => boolean
            addFilter: (input: string) => void
        }

        serialize: {
            serialize: (bricks: Brick[]) => Buffer
            deserialize: (data: Buffer) => Brick[]
        }

        color: {
            randomHexColor: () => string
            convertRGB: (r: number, g: number, b: number) => number[]
            hexToDec: (hex: string, bgr?: boolean) => string
            hexToRGB: (hex: string) => number[]
            rgbToBgr: (rgb: string) => string
            rgbToDec: (r: number, g: number, b: number) => string
            rgbToHex: (r: number, g: number, b: number) => string
        }

        chat: {
            generateTitle: (Player: Player, message: string) => string
            validateMessage: (Player: Player, message: string) => boolean
            removeColorTags: (input: string) => string
        }
    }

    interface World {
        /** An array containing all the teams in the game. */
        teams: Array<Team>,
        /** An object containing various environment properties. */
        environment: Environment,
        /** An array containg all the bricks in the game. */
        bricks: Array<Brick>,
        /** An array containing bricks, when a player respawns it will choose a random position from a brick in this array. */
        spawns: Array<Brick>,
        /** An array containing all the bots in the game. */
        bots: Array<Bot>,
        /** An array of all the tools in the game. */
        tools: Array<Tool>,
        /** An array of all the sound emitters in the game. */
        sounds: Array<SoundEmitter>,
    }

    //Classes

    class SoundEmitter extends EventEmitter {
        name: string

        netId: number

        /** Item id of the sound to use */
        sound: number

        /** Volume of the sound emitted */
        volume: number

        /** Pitch of the sound emitted */
        pitch: number

        /** Range of the sound emitted */
        range: number

        /** Whether or not to loop the sound */
        loop: boolean

        /** Whether or not to play the sound globally */
        global: boolean

        position: Vector3

        /** If .destroy() has been called on the sound emitter. */
        destroyed: boolean

        private _steps: Array<NodeJS.Timeout>

        static soundEmitterId: number

        constructor(sound: number, position: Vector3, range: number)

        /** Remove the sound emitter from Game.world, \
         * clear all event listeners, \
         * and tell clients to delete the sound emitter. */
        destroy(): void

        /**
     * Identical to setInterval, but will be cleared after the sound emitter is destroyed.
     * Use this if you want to attach loops to sound emitters, but don't want to worry about clearing them after they're destroyed.
     * @param callback The callback function.
     * @param delay The delay in milliseconds.
     */
        setInterval(callback: () => void, delay: number): NodeJS.Timeout

        /** Set the position of the sound emitter. */
        setPosition(position: Vector3): Promise<boolean>

        /** Set the volume of the sound emitter. */
        setVolume(volume: number): Promise<boolean>

        /** Set the pitch of the sound emitter. */
        setPitch(pitch: number): Promise<boolean>

        /** Set the looping of the sound emitter. */
        setLoop(loop: boolean): Promise<boolean>

        /** Set the range of the sound emitter. */
        setRange(range: number): Promise<boolean>

        setGlobal(global: boolean): Promise<boolean>

        /** Set the sound to emit. */
        setSound(sound: number): Promise<boolean>

        /** Play the sound */
        play(): Promise<boolean>

        /** Stop the sound */
        stop(): Promise<boolean>
    }

    class Bot extends EventEmitter {
        name: string

        netId: number

        /** The speech bubble of the bot. ("" = empty). */
        speech: string

        position: Vector3

        rotation: Vector3

        scale: Vector3

        /** If .destroy() has been called on the bot. */
        destroyed: boolean
        /** An object containing the body colors of the bot. */
        colors: BodyColors

        /** An object containing the current assets worn by the bot. */
        assets: Assets

        private _hitMonitor: NodeJS.Timer

        private _steps: Array<NodeJS.Timeout>

        static botId: number

        constructor(name: string)

        /** Remove the bot from Game.world, \
         * clear all event listeners, \
         * stop hit detection, \
         * and tell clients to delete the bot. */
        destroy(): void

        /**
     * Identical to setInterval, but will be cleared after the bot is destroyed.
     * Use this if you want to attach loops to bots, but don't want to worry about clearing them after they're destroyed.
     * @param callback The callback function.
     * @param delay The delay in milliseconds.
     */
        setInterval(callback: Function, delay: number): NodeJS.Timeout

        /** Set the position of the bot. */
        setPosition(position: Vector3): Promise<boolean>

        /** Set the rotation of the bot. */
        setRotation(rotation: Vector3): Promise<boolean>

        /** Set the scale of the bot. */
        setScale(scale: Vector3): Promise<boolean>

        /** Set the speech of the bot. */
        setSpeech(speech: string): Promise<boolean>

        setOutfit(outfit: Outfit): Promise<boolean>

        /** Sets the bot's z rotation to the point provided. */
        lookAtPoint(position: Vector3): number

        /** Turns the bot to face the player provided. */
        lookAtPlayer(player: Player): number

        /** Moves the bot to the point provided. */
        moveTowardsPoint(pos: Vector3, speed: number): Promise<boolean>

        /** Moves the bot towards the player. */
        moveTowardsPlayer(player: Player, speed: number): Promise<boolean>

        /** Returns the closest player to the bot, or null. */
        findClosestPlayer<T extends Player>(minDist: number): T

        /** Sets the bots avatar to a provided userId. */
        setAvatar(userId: number): Promise<boolean>

        /** Starts hit detection for the bot. */
        touching<T extends Player>(callback: (player: T) => void): Disconnectable

        private _detectTouching()
    }

    class Brick extends EventEmitter {
        /** The name of the brick. */
        name: string

        /** The current color of the brick. */
        color: string

        /** The current position of the brick. */
        position: Vector3

        /** The current scale of the brick. */
        scale: Vector3

        /** If enabled, the brick will emit lighting. */
        lightEnabled: boolean

        /** The current light color (in hex) of the brick. */
        lightColor: string

        /** The range of the brick's lighting. */
        lightRange: number

        /** The visibility of the brick. (1 = fully visible, 0 = invisible)*/
        visibility: number

        /** If .destroy() has been called on the brick. */
        destroyed: boolean

        /** The network id of the brick. */
        netId: number

        /** If the brick is passable by other players. */
        collision: boolean

        /** The current rotation of the brick (must be % 90). */
        rotation: Vector3

        /** The asset id the brick will appear as. */
        model: number

        /** Whether or not the brick is a clickable brick. */
        clickable: boolean

        /** The minimum distance a player must be to click the brick (if it is a clickable brick). */
        clickDistance: number

        /** If player.newBrick() is called, a socket is attached to the brick, so the brick changes \
         * will be sent to the player instead of everyone.
         */
        socket: ClientSocket

        /** The shape of the brick. */
        shape: string

        private _hitMonitor?: NodeJS.Timeout

        private _hitMonitorSpeed: number

        private _hitMonitorActive: boolean

        private _playersTouching: Set<Player>

        private _steps: Array<NodeJS.Timeout>

        static brickId: number

        constructor(position: Vector3, scale: Vector3, color: string)

        get center(): Vector3

        setPosition(position: Vector3): Promise<boolean>

        setScale(scale: Vector3): Promise<boolean>

        setRotation(rot: Vector3): Promise<boolean>

        setModel(model: number): Promise<boolean>

        setColor(color: string): Promise<boolean>

        setLightColor(color: string): Promise<boolean>

        setLightRange(range: number): Promise<boolean>

        setVisibility(visibility: number): Promise<boolean>

        setCollision(collision: boolean): Promise<boolean>

        setClickable(clickable: boolean, clickDistance: number): Promise<boolean>

        /**
         * Identical to setInterval, but will be cleared after the brick is destroyed.
         * Use this if you want to attach loops to bricks, but don't want to worry about clearing them after they're destroyed.
         * @param callback The callback function.
         * @param delay The delay in milliseconds.
         */
        setInterval(callback: Function, delay: number): NodeJS.Timeout

        clone(): Brick

        _cleanup(): void

        destroy(): void

        private _hitDetection()
        /**
         * Makes the Brick point towards a point in a Vector3 plane.
         * @example
         * ```js
         * const camera = world.bricks.find(brick => brick.name === 'cameraBrick')
         * const dummyObject = world.bricks.find(brick => brick.name === 'object')
         * 
         * camera.pointTowards(dummyObject.position)
         * ```
         */
        pointTowards(point: Vector3): Promise<boolean>
        /** 
        * Calls the specified callback when a player clicks the brick.
        * @callback
        * @example
        * ```js
        * const purpleBrick = world.bricks.find(brick => brick.name === 'purpleBrick')
        * 
        * purpleBrick.clicked((player, secure) => {
        *   if (!secure) return // The server has validated that the player is currently *near* the brick.
        *   console.log(player.username + " clicked this brick!")
        * })
        * ```
        */
        clicked<T extends Player>(callback: (player: T, secure?: boolean) => void): Disconnectable

        /** 
        * Calls the specified callback when a player (who previously touched the brick) steps off of it. \
        * This will fire even if the player dies while touching the brick.
        * 
        * However, if the player leaves the game this will *NOT* fire.
        * @callback
        * @example
        * ```js
        * const purpleBrick = world.bricks.find(brick => brick.name === 'purpleBrick')
        * 
        * purpleBrick.touchingEnded((player) => {
        *   console.log("Get back on that brick!")
        * })
        * ```
        */
        touchingEnded<T extends Player>(callback: (player: T) => void): Disconnectable

        /** 
        * Calls the specified callback with the player who touched the brick.
        * @callback
        * @example
        * ```js
        * const purpleBrick = world.bricks.find(brick => brick.name === "purpleBrick")
        * 
        * purpleBrick.touching((player) => {
        *   player.kill()
        * })
        * ```
        */
        touching<T extends Player>(callback: (player: T) => void): Disconnectable

        private _detectTouching()

        /**
         * Checks if this brick is colliding with another
         * @param brick The brick used to check collision against
         */
        intersects(brick: Brick): boolean
    }

    class Outfit {
        _idString: Set<string>
        assets: Partial<Assets>
        colors: Partial<BodyColors>

        constructor()

        /** Sets the player's hat1 to the asset id specified. */
        hat1(hatId: number): Outfit

        /** Sets the player's hat2 to the asset id specified. */
        hat2(hatId: number): Outfit

        /** Sets the player's hat3 to the asset id specified. */
        hat3(hatId: number): Outfit

        /** Sets the player's face to the asset id specified. */
        face(faceId: number): Outfit

        /** Sets the player's shirt to the asset id specified. */
        /**
        * @deprecated Use {@link clothing1} instead.
        */
        shirt(shirtId: number): Outfit
    
        /** Sets the player's pants to the asset id specified. */
        /** 
        * @deprecated Use {@link clothing2} instead.
        */
        pants(pantsId: number): Outfit
    
        /** Sets the player's tshirt to the asset id specified. */
        /** 
        * @deprecated Use {@link clothing3} instead.
        */
        tshirt(tshirtId: number): Outfit
    
        /** Sets the player's clothing1 to the asset id specified. */
        clothing1(clothingid: number): Outfit
    
        /** Sets the player's clothing2 to the asset id specified. */
        clothing2(clothingid: number): Outfit
    
        /** Sets the player's clothing3 to the asset id specified. */
        clothing3(clothingid: number): Outfit
    
        /** Sets the player's clothing4 to the asset id specified. */
        clothing4(clothingid: number): Outfit
    
        /** Sets the player's clothing5 to the asset id specified. */
        clothing5(clothingid: number): Outfit

        /** Sets all of the player's body colors to a hex string. */
        body(color: string): Outfit

        /** Sets the player's head color to a hex string. */
        head(color: string): Outfit

        /** Sets the player's torso color to a hex string. */
        torso(color: string): Outfit

        /** Sets the player's right arm color to a hex string. */
        rightArm(color: string): Outfit

        /** Sets the player's left arm color to a hex string. */
        leftArm(color: string): Outfit

        /** Sets the player's left leg color to a hex string. */
        leftLeg(color: string): Outfit

        /** Sets the player's right leg color to a hex string. */
        rightLeg(color: string): Outfit

        /** Copies a player or bot's entire outfit (assets + body colors). */
        copy(player: Player | Bot): Outfit

        get idString(): string
    }

    class PacketBuilder {
        packetId: number
        idString: string
        compression: boolean
        buffer: SmartBuffer
        options: PacketBuilderOptions

        constructor(packetType: keyof typeof PacketEnums | PacketEnums, options?: PacketBuilderOptions)

        write(type: string, data: number | string | boolean): PacketBuilder

        writeHeader(): void

        writeAsset(assetId: number): Promise<PacketBuilder>

        // Convert SmartBuffer to a buffer, compress it, and add uintv size to header.
        private transformPacket()

        /** 
         * Send a packet to every connected client except for players specified.
        */
        broadcastExcept(players: Array<Player>): Promise<boolean>

        /**
         * Send a packet to every connected client.
         */
        broadcast(): Promise<boolean>

        /**
         * Send a packet to a single client.
        */
        send(socket: ClientSocket): Promise<boolean>
    }

    class Player extends EventEmitter {
        public on<K extends keyof PlayerEventListeners>(event: K, listener: (...args: PlayerEventListeners[K]) => void): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof PlayerEventListeners>,
            listener: (...args: any[]) => void,
        ): this;

        /** 
         * Fires once when the player fully loads. (camera settings, map loads, players downloaded, etc).
         * @event
         * @example
         * ```js
         * Game.on("playerJoin", (player) => {
        *    player.on("initialSpawn", () => {
        *        player.prompt("Hello there!")
        *    })
        * })
        * ```
        */

        static readonly initialSpawn = PlayerEvents.InitialSpawn

        /** 
         * Fires whenever a player dies (health set to 0).
         * @event
         * @example
         * ```js
         * Game.on("playerJoin", (player) => {
        *    player.on("died", () => {
        *        player.kick("This is a hardcore server.")
        *    })
        * })
        * ```
        */

        static readonly died = PlayerEvents.Died

        /** 
         * Fires whenever a player spawns (respawn() is called.)
         * @event
         * @example
         * ```js
         * Game.on("playerJoin", (player) => {
         *    player.on("respawn", () => {
         *        player.setHealth(1000)
         *    })
         * })
         * ```
         */

        static readonly respawn = PlayerEvents.Respawn

        /** 
         * Fires whenever a player's outfit loads.
         * @event
         * @example
         * ```js
         * Game.on("playerJoin", (player) => {
         *    player.on("avatarLoaded", () => {
         *        // The outfit is now loaded.
         *    })
         * })
         * ```
         */

        static readonly avatarLoaded = PlayerEvents.AvatarLoaded

        /** 
         * Fires whenever the player chats. Functionality-wise this behaves like `Game.on("chatted")`.
         * @event
         * @param message Message
         * @example
         * ```js
         * Game.on("playerJoin", (player) => {
         *    player.on("chatted", (message) => {
         *        // The player chatted.
         *    })
         * })
         * ```
         */
        static readonly chatted = PlayerEvents.Chatted

        /**
         * Fires whenever this player moves.
         * @event
         * @param newPosition The new position of the player
         * @param newRotation The new rotation of the player
         * ```js
         * player.on("moved", (newPosition, newRotation)=>{
         *    console.log(`${player.username} moved to ${newPosition.x}, ${newPosition.y}, ${newPosition.z}`)
         * })
         */
        static readonly moved = PlayerEvents.Moved

        readonly socket: ClientSocket

        authenticated: boolean

        readonly netId: number

        private _steps: Array<NodeJS.Timeout>

        private _positionDeltaTime: number

        /** The Brick Hill userId of the player. */
        readonly userId: number

        /** If the player is a Brick Hill admin (Does not work if local is set to true.)*/
        readonly admin: boolean

        /** The username of the player.*/
        readonly username: string

        /** The membershipType of the player. */
        readonly membershipType: number

        /** The player's client type */
        readonly client: Client

        /** The validation token of the player */
        readonly validationToken: string

        /** True if the player has left the game. */
        destroyed: boolean

        /** The current position of the player. */
        position: Vector3

        /** The current rotation of the player. */
        rotation: Vector3

        /** The current scale of the player. */
        scale: Vector3

        /** The current camera position of the player. */
        cameraPosition: Vector3

        /** The current camera rotation of the player. */
        cameraRotation: Vector3

        /** The camera field of view of the player. */
        cameraFOV: number

        /** The distance of how far the camera is away from the player. */
        cameraDistance: number

        /** The current camera type of the player. */
        cameraType: CameraType

        /** The player the camera is currently attached to. */
        cameraObject: Player

        /** An object containing all of the body colors the player has. */
        colors: BodyColors

        /** An object containing all of the assets the player is currently wearing. */
        assets: Assets

        /** An array containing userIds of players the player has blocked. Do NOT store player references in here. **/
        blockedUsers: Array<number>

        /** The value the player's health will be set to when they respawn. **/
        maxHealth: number

        /** The current health of the player. */
        health: number

        /** If the player is alive or not. */
        alive: boolean

        /** If set to true, the server will reject any chat attempts from the player. **/
        muted: boolean

        /** The current speed of the player. */
        speed: number

        /** How high the player can jump. */
        jumpPower: number

        /** Gravity for player's physics. */
        gravity: number

        /** The current score of the player. */
        score: number

        /** The current speech bubble of the player. ("" = empty). */
        speech: string

        /** The current team the player is on. */
        team: Team

        /** An array of tools the player has in their inventory. */
        inventory: Array<Tool>

        /** The current tool the player has equipped. */
        toolEquipped: Tool

        /** If set, the player's nametag color (in chat) will be set to the hex value you put. */
        chatColor: string

        /** If set to false, the player will not automatically load their avatar. */
        loadAvatar: boolean

        /** Used by the avatarLoaded() method to determine if the avatar already loaded. */
        _avatarLoaded: boolean

        /** If set to false, the player will not spawn with their tool equipped. \
         * loadAvatar MUST be enabled for this to work.*/
        loadTool: boolean

        /**
         * If set, player.respawn() will spawn the player in the value provided instead of a random location.
         * This property overrides spawnHandler.
         * @see {@link respawn}
         */
        spawnPosition?: Vector3

        /**
         * A function that will be called whenever player.respawn() is called.
         */
        spawnHandler: (player: Player) => Vector3

        /** An array containing all local bricks on the player's client. */
        localBricks?: Array<Brick>

        static playerId: number

        private constructor(socket: ClientSocket)

        /** 
         * Calls back whenever the player clicks.
         * @deprecated New player.keyPressed and player.keyReleased api allows more functionality
         * @callback
         * @example
         * ```js
         * player.mouseclick(() => {
         *    // The player clicked.
         * })
         * ```
         */
        mouseclick(callback: () => void): Disconnectable

        /** 
         * Calls back whenever the player presses a key.
         * @callback
         * @example
         * ```js
         * Game.on("initialSpawn", (player) => {
         *    player.speedCooldown = false
         * 
         *    player.keypress(async(key) => {
         *        if (player.speedCooldown) return
         *        if (key === "shift") {
         *            player.speedCooldown = true
         *            
         *            player.bottomPrint("Boost activated!", 3)
         *            
         *            player.setSpeed(8)
         * 
         *            await sleep(3000)
         * 
         *            player.setSpeed(4)
         * 
         *            player.bottomPrint("Boost cooldown...", 6)
         * 
         *            setTimeout(() => {
         *                player.speedCooldown = false
         *            }, 6000)
         *        }
         *    })
         * })
         * ```
         **/

        keypress(callback: (key: KeyTypes) => void): Disconnectable
        
        /** 
        * Calls back whenever the player presses a key.
        * @callback
        **/

        keyPressed(key: KeyTypes, callback: (() => void)): Disconnectable
        
        /** 
        * Calls back whenever the player releases a key.
        * @callback
        **/

        keyReleased(key: KeyTypes, callback: (() => void)): Disconnectable
        /**
         * Kicks the player from the game.
         * @param message The kick message
         */
        kick(message: string): Promise<void>

        /**
         * Clears all of the bricks for the player. This is a LOCAL change. \
         * world.bricks will not be updated!
         */
        clearMap(): Promise<boolean>

        private _log(message: string, broadcast: boolean)

        private _removePlayer()

        topPrint(message: string, seconds?: number): Promise<boolean>

        centerPrint(message: string, seconds?: number): Promise<boolean>

        bottomPrint(message: string, seconds?: number): Promise<boolean>

        /** Prompts a confirm window on the player's client. */
        prompt(message: string): Promise<boolean>

        /**
         * Sends a local message to the player.
         * @param message The message
         */
        message(message: string): Promise<boolean>

        /** Sends a chat message to everyone, conforming to rate-limit / mute checks, etc. */
        messageAll(message: string, generateTitle: boolean): Promise<boolean>

        setOutfit(outfit: Outfit): Promise<any[]>

        /** Sets the players health. If the health provided is larger than maxHealth, maxHealth will automatically be \
         *  set to the new health value.
         */
        setHealth(health: number): Promise<boolean | any[]>

        setScore(score: number): Promise<boolean>

        setTeam(team: Team): Promise<boolean>

        private _greet()

        setCameraPosition(position: Vector3): Promise<boolean>

        setCameraRotation(rotation: Vector3): Promise<boolean>

        setCameraDistance(distance: number): Promise<boolean>

        setCameraFOV(fov: number): Promise<boolean>

        setCameraObject(player: Player): Promise<boolean>

        setCameraType(type: CameraType): Promise<boolean>

        /** Returns an arary of all the players currently blocking this user. */
        getBlockedPlayers(): Player[]

        /** Adds the tool to the user's inventory. */
        addTool(tool: Tool): Promise<boolean>

        /** Unequips the tool (if equipped), and removes it from player's inventory. */
        removeTool(tool: Tool): Promise<boolean>

        /** Takes an array of bricks and loads them to the client locally. */
        loadBricks(bricks: Brick[]): Promise<boolean>

        loadSounds(sounds: Array<SoundEmitter>): Promise<boolean>

        playSound(sound: SoundEmitter): Promise<boolean>

        stopSound(sound: SoundEmitter): Promise<boolean>

        destroySound(sound: SoundEmitter): Promise<boolean>

        /** Takes an array of bricks, and deletes them all from this client. */
        deleteBricks(bricks: Brick[]): Promise<boolean>

        /**
         * @deprecated
         * Same as player.removeTool
         */
        destroyTool: typeof this.removeTool

        /** Equips the tool, if It's not already in the user's inventory it will be added first. \
         * If you call this on a tool that is already equipped, it will be unequipped.
         */
        equipTool(tool: Tool): Promise<boolean>

        /** Unequips the tool from the player, but does not remove it from their inventory. */
        unequipTool(tool: Tool): Promise<boolean>

        setSpeech(speech: string): Promise<boolean>

        setSpeed(speedValue: number): Promise<boolean>

        setJumpPower(power: number): Promise<boolean>

        setGravity(gravityValue: number): Promise<boolean>

        private _getClients()

        /**@hidden */
        private _updatePositionForOthers(pos: Array<number>)

        /**Clones a brick locally to the player's client, returns the newly created local brick. */
        newBrick(brick: Brick): Promise<Brick>

        /**Clones an array of bricks locally to the player's client, returns an array containing the cloned bricks. */
        newBricks(bricks: Brick[]): Promise<Brick[]>

        setPosition(position: Vector3): Promise<boolean>

        setScale(scale: Vector3): Promise<boolean>

        /**
         * Sets the appearance of the player. \
         * If a userId isn't specified, it will default to the player's userId.
         * 
         * Error handling is highly recommended as this function makes a HTTP request.
         */
        setAvatar(userId: number): Promise<any[]>

        avatarLoaded(): Promise<void>

        /**
         * Returns player stats in JSON from this API: \
         * https://sandpile.xyz/api/getUserInfoById/?id={userId} 
         * @example
         * ```js
         * Game.on("playerJoin", async(player) => {
         *  const data = await player.getUserInfo()
         *  console.log(data)
         * })
         * ```
         */
        getUserInfo(): Promise<JSON>

        /**
         * Returns true or false if the player owns a specified assetId.
         * 
         * @example
         * ```js
         * Game.on("initialSpawn", async(p) => {
         *      let ownsAsset = await p.ownsAsset(106530)
         *      console.log("Player owns asset: ", ownsAsset)
         * })
        ``` 
            */
        ownsAsset(assetId: number): Promise<boolean>

        /**
         * Returns true or false if the player owns a specified badgeId.
         * 
         * @example
         * ```js
         * Game.on("initialSpawn", async(p) => {
         *      let ownsBadge = await p.ownsBadge(1256)
         *      console.log("Player owns badge: ", ownsBadge)
         * })
         * ``` 
        */
        ownsBadge(badgeId: number): Promise<boolean>

        /**
         * Grants a badge to the player. Note that the badge must be offsale to be grantable.
         * 
         * @example
         * ```js
         * Game.on("initialSpawn", async(p) => {
         *      let response = await p.grantBadge(1256)
         *      console.log("Grant response: ", response)
         * })
         * ``` 
        */
        grantBadge(badgeId: number): Promise<boolean>

        // /**
        //  * Returns JSON data of total value and direction of users crate \
        //  * https://api.brick-hill.com/v1/user/1/value
        //  * 
        //  * @example
        //  * ```js
        //  * Game.on("playerJoin", async(p) => {
        //  *  let worth = await p.getValue(1524)
        //  *  console.log("Player is worth: ", worth.value)
        //  * })
        // ``` 
        //     */
        // getValue(): Promise<JSON>

        // /**
        //  * Returns JSON data of the users rank in a group, or false if they aren't in the group. \
        //  * https://api.brick-hill.com/v1/clan/member?id=1&user=1
        //  * @example
        //  * ```js
        //  * Game.on("playerJoin", async(player) => {
        //  *  const groupData = await player.getRankInGroup(5)
        //  *  if (groupData) {
        //  *      console.log(groupData)
        //  *  } else {
        //  *      console.log("Player is not in group.")
        //  *  }
        //  * })
        // * ```
        //     */
        // getRankInGroup(groupId: number): Promise<JSON | boolean>

        kill(): Promise<any[]>

        /** Respawns the player. */
        respawn(): Promise<any[]>

        /**
         * Identical to setInterval, but will be cleared after the player is destroyed.
         * Use this if you want to attach loops to players, but don't want to worry about clearing them.
         * @param callback The callback function.
         * @param delay The delay in milliseconds.
         */
        setInterval(callback: Function, delay: number): NodeJS.Timeout

        /**
         * Functionally the same to Game.setEnvironment, but sets the environment only for one player.
         * @example
         * ```js
         * Game.on("playerJoin", (p) => {
         *  p.setEnvironment( {skyColor: "6ff542"} )
         * })
         */
        setEnvironment(environment: Partial<Environment>): Promise<boolean[]>

        private _createFigures()

        private _createTools()

        private _createTeams()

        private _createBots()

        /**@hidden */
        private _left()

        /**@hidden */
        private _joined()
    }

    class Team {
        readonly name: string

        readonly color: string

        readonly netId: number

        static teamId: number

        constructor(name: string, color: string)

        /*
        Returns an array of all the player's currently on this team.
        */
        get players(): Array<Player>
    }

    class Tool extends EventEmitter {

        public on<T extends Player, K extends keyof ToolEventListeners<Player>>(event: K, listener: (...args: ToolEventListeners<T>[K]) => void): this;
        public on<S extends string | symbol>(
            event: Exclude<S, keyof ToolEventListeners<Player>>,
            listener: (...args: any[]) => void,
        ): this;

        /** The name of the tool. **/
        readonly name: string
        /** If set to false, players will not be able to equip or de-equip the tool. */
        enabled: boolean
        /** The assetId of the tool's model. */
        model: number
        /** The slotId of the tool. [Used internally].*/
        private _slotId: number

        static toolId: number

        /** 
        * Fires when a player holding the tool clicks the left mouse button. \
        * This will not be emitted if you disable the toolHandler.js core script.
        * @event
        * @example
        * ```js
        * let tool = new Tool("Balloon")
        * tool.model = 84038
        * Game.on("playerJoin", (player) => {
        *    player.on("initialSpawn", () => {
        *        player.equipTool(tool)
        *    })
        * })
        * tool.on("activated", (p) => {
        *   console.log(p.username + " has clicked with the tool equipped!")
        * })
        * ```
        */
        static readonly activated = ToolEvents.Activated

        /** Fires when a player equips a tool. 
         * @event */
        static readonly equipped = ToolEvents.Equipped


        /** Fires when a player unequips a tool. 
         * @event */
        static readonly unequipped = ToolEvents.Unequipped

        constructor(name: string)

        /** Calls the specified callback with the player who un-equipped the tool.
        * @example
        * ```js
        * let tool = new Tool("Balloon")
        * tool.model = 84038
        * tool.unequipped((p) => {
        *   p.setJumpPower(5) // Reset their jump power back to normal.
        * })
        * ```
        */
        unequipped<T extends Player>(callback: (player: T) => void): Disconnectable

        /** 
        * Calls the specified callback with the player who equipped the tool.
        * @example
        * ```js
        * let tool = new Tool("Balloon")
        * tool.model = 84038
        * tool.equipped((p) => {
        *   p.setJumpPower(20) // Give the player a height boost
        * })
        * ```
        */
        equipped<T extends Player>(callback: (player: T) => void): Disconnectable

        /** Completely destroys the tool, unequips it from all players, deletes it from their inventroy, and removes it from Game.world.tools. */
        destroy(): Promise<boolean>
    }

    class Vector3 {
        x: number
        y: number
        z: number

        constructor(x?: number, y?: number, z?: number)

        copy(): Vector3

        fromVector(vector: Vector3): Vector3

        equalsVector(vector: Vector3): boolean

        addVector(vector: Vector3): Vector3

        add(x: number, y: number, z: number): Vector3

        subVector(vector: Vector3): Vector3

        sub(x: number, y: number, z: number): Vector3

        multiplyVector(vector: Vector3): Vector3

        multiply(x: number, y: number, z: number): Vector3
    }
}

//Private

declare class AssetDownloaderClass {
    cache: Record<number, AssetData>

    constructor()

    getAssetData(assetId: number): Promise<AssetData>
}

declare interface GameEventListeners<T extends Player>
{
    chat: [player: T, message: string],
    chatted: [player: T],
    initialSpawn: [player: T],
    playerJoin: [player: T],
    playerLeave: [player: T],
    scriptsLoaded: [],
    setDataLoaded: [],
}

declare interface PlayerEventListeners
{
    avatarLoaded: [],
    chatted: [message: string],
    died: [],
    initialSpawn: [],
    moved: [newPosition: Vector3, newRotation: Vector3],
    respawn: [],
}

declare interface ToolEventListeners<T extends Player>
{
    activated: [player: T],
    equipped: [player: T],
    unequipped: [player: T],
}

declare class GameClass extends EventEmitter {

    public on<T extends Player, K extends keyof GameEventListeners<T>>(event: K, listener: (...args: GameEventListeners<T>[K]) => void): this;
    public on<S extends string | symbol>(
        event: Exclude<S, keyof GameEventListeners<Player>>,
        listener: (...args: any[]) => void,
    ): this;

    /** 
     * Identical to player.on("initialSpawn").
     * @event
     * @example
     * ```js
     * Game.on("initialSpawn", (player) => {
     *    // "player" is now fully loaded.
    * })
    * ```
    */

    static readonly initialSpawn = GameEvents.InitialSpawn

    /** 
     * Fires immediately whenever a player joins the game. (Before player downloads bricks, players, assets, etc).
     * @event
     * @param player [Player]{@link Player}
     * @example
     * ```js
     * Game.on("playerJoin", (player) => {
     *    console.log("Hello: " + player.username)
     * })
     * ```
     */
    static readonly playerJoin = GameEvents.PlayerJoin

    /** 
     * Fires whenever a player leaves the game.
     * @event
     * @param player [{@link Player}]
     * @example
     * ```js
     * Game.on("playerLeave", (player) => {
     *    console.log("Goodbye: " + player.username)
     * })
     * ```
     */
    static readonly playerLeave = GameEvents.PlayerLeave

    /** 
     * Fires whenever any player chats in the game.
     * @event
     * @param player [Player]{@link Player}
     * @param message Message
     * @example
     * ```js
     * Game.on("chatted", (player, message) => {
     *    console.log(message)
     * })
     * ```
     */
    static readonly chatted = GameEvents.Chatted

    /** 
     * If a `Game.on("chat")` listener is added, any time the game recieves a chat message, it will be emitted data to this listener, and
     * the actual packet for sending the chat will not be sent.
     * 
     * You can use this to intercept chat messages, and then transform them to whatever, and then call `Game.messageAll`.
     * @event
     * @param player [Player]{@link Player}
     * @param message Message
     * @example
     * ```js
     * Game.on("chat", (player, message) => {
     *    Game.messageAll(player.username + " screams loudly: " + message)
     * })
     * ```
     */
    static readonly chat = GameEvents.Chat

    /** @readonly An array of all currently in-game (and authenticated) players. */
    players: Array<Player>

    /** @readonly The package.json "version" of the node-hill library. **/
    version: string

    /** @readonly The set id of the server. */
    gameId: number

    /** @readonly The host key of the server. */
    hostKey: string

    /** @readonly The ip of the server. */
    ip: string

    /** @readonly The port of the server. */
    port: number

    /** @readonly The map name of the server (ie: `Map.brk`) if a map is specfied.*/
    map: string

    /** The folder directory of where the server's maps are located. */
    mapDirectory: string

    /** @readonly The folder directory of where the server's user scripts are located. */
    userScripts: string

    /** @readonly If the server is currently running locally. */
    local: boolean

    /** @readonly If the files in user_script will be loaded recursively */
    recursiveLoading: boolean

    /**
     * This property is to compensate for a client bug. If the player team is
     * not set automatically, the user's name won't appear on their client's leaderboard.
     * 
     * Only disable this if you are going to set the player's team when they join.
     */
    assignRandomTeam: boolean

    /** If set to false, players will not spawn in the game. */
    playerSpawning: boolean

    /** If set to false, the bricks of the map will not be sent to the player when they join. But they will still be loaded into memory. */
    sendBricks: boolean

    /** An array of the core scripts disabled. (ie: `["respawn.js"]`).*/
    disabledCoreScripts: Array<string>

    /** A direct pointer to the server start settings (usually start.js) */
    serverSettings: GameSettings

    /** If set to false server join messages, etc will not be sent to players. */
    systemMessages: boolean

    /**
     * The message that will be sent to players (locally) who join the game.
     * 
     * @default [#14d8ff][NOTICE]: This server is proudly hosted with node-hill {@link version}.
     */
    MOTD: string

    /**
     * An object containing players, teams, environment settings, etc.
     * @global
     */
    world: World

    environment: Environment

    /** @readonly An object containing a list of the modules loaded  server settings. */
    modules: Record<string, unknown>

    /** @readonly The name of the game. */
    name: string

    /** @readonly The main server TCP socket. */
    server: Server

    banNonClientTraffic: boolean

    chatSettings: Record<'rateLimit', number>

    setData: Record<string, never> | SetData

    afterAuth: (player: Player) => Promise<void>

    constructor()

    /**  
     * Returns player stats in JSON from this API: \
     * https://api.brick-hill.com/v1/user/profile?id={userId}
     * 
    */
    getUserInfo(userId: number): Promise<JSON>

    /** Sends a chat message to every player in the game. */
    messageAll(message: string): Promise<boolean>

    topPrintAll(message: string, seconds: number): Promise<boolean>

    centerPrintAll(message: string, seconds: number): Promise<boolean>

    bottomPrintAll(message: string, seconds: number): Promise<boolean>

    /** 
    * Commands are sent from the client when a user prefixes their message with `/` followed by any string. \
    * In the example below, "kick" would be the command, and "user" the argument: \
    * **Example**: `/kick user`
    * @callback
    * @example
    * ```js
    * Game.command("kick", (caller, args) => {
    *   if (caller.userId !== 2760) return // You're not dragonian!
    *   for (let player of Game.players) {
    *       if (player.username.startsWith(args)) {
    *           return player.kick("Kicked by Dragonian!")
    *       }
    *   }
    * })
    * ```
    */
    command<T extends Player>(gameCommand: string, validator: (Player: T, args: string, next: () => void) => void, callback?: () => void): Disconnectable

    /**
     * Identical to Game.command, but instead of a string it takes an array of commands.
     * 
     * This will assign them all to the same callback, this is very useful for creating alias commands.
     * @see {@link command}
     * @example
     * ```js
     * Game.commands(["msg", "message"], (p, args) => {
     *      Game.messageAll(args)
     * })
     * ```
     */
    commands<T extends Player>(gameCommand: string[], validator: (Player: T, args: string, next: () => void) => void, callback?: () => void): Disconnectable
    /** Returns the data for provided setId. **/
    getSetData(setId: number): Promise<{id: number, name: string, creator: {id: number, name: string}}>

    /** "Parents" a bot class to the game. **/
    newBot(bot: Bot): Promise<boolean>

    newTool(tool: Tool): Promise<boolean>

    newBricks(bricks: Brick[]): Promise<boolean>

    /** "Parents" a brick class to the game. You should do this after setting all the brick properties. */
    newBrick(brick: Brick): Promise<boolean>

    newSoundEmitter(sound: SoundEmitter): Promise<boolean>

    /** Takes an array of bricks, and deletes them all from every client. This will modify world.bricks. */
    deleteBricks(bricks: Brick[]): Promise<boolean>

    /** Takes an array of teams and loads them to all clients.
     * @example
     * ```js
     * let teams = {
     *  redTeam: new Team("Red Team", "#f54242"),
     *  blueTeam: new Team("Blue Team", "#0051ff")
     * }
     * 
     * Game.newTeams(Object.values(teams))
     * ```
     */
    newTeams(teams: Array<Team>): Promise<boolean>

    newTeam(team: Team): Promise<boolean>

    /** Takes an array of bricks and loads them to all clients. */
    loadBricks(bricks: Array<Brick>): Promise<boolean>

    /**
     * Sets the environment for every player in the game.
     * 
     * Patches the world.environment with keys containing new properties.
     * 
     * @example
     * ```js
     * Game.setEnvironment({ baseSize: 500 })
     * ```
     */
    setEnvironment(environment: Partial<Environment>): Promise<boolean[]>

    /**
     * Clears the map, and then calls loadBrk with the provided brk name.
     * Then it sets all the bricks in the game, spawns, and Game.map.
     * 
     * MapData: bricks, spawns, environment, tools, teams, etc is returned.
     * 
     * @example
     * ```js
     * setTimeout(async() => {
     *      // Load all bricks + spawns in the game
     *      let data = await Game.loadBrk("headquarters2.brk")
     *  
     *      // Set the environment details (loadBrk does not do this).
     *      Game.setEnvironment(data.environment)
     * 
     *      // This brk added spawns, let's respawn players so they aren't trapped in a brick.
     *      Game.players.forEach((player) => {
     *          player.respawn()
     *      })
     * 
     *      console.log(data)
     * }, 60000)
     */
    loadBrk(location: string): Promise<MapData>

    /**
     * Loads the brk file like Game.loadBrk, but returns the data rather than setting / modifying anything.
     * 
     * This is useful if you want to grab teams, bricks, etc from a brk, but don't want to modify the game yet.
     */
    parseBrk(location: string): Promise<MapData>

    /**
     * Clears all of the bricks for every player connected. This wipes world.bricks, any new players who
     * join after this is ran will download no bricks from the server.
     */
    clearMap(): Promise<boolean>

    bindToClose(callback: () => null): void

    /**
     * Exits the server process, and terminates any running scripts.
     * @see {@link https://nodejs.org/api/process.html#process_process_exit_code} for more information.
    */
    shutdown(status: number): never

    /** Return the distance between two points. */
    pointDistance3D(p1: Vector3, p2: Vector3): number

    /**@hidden */
    private _newPlayer(p)

    /**@hidden */
    private _playerLeft(p)
}

declare class SanctionClass {
    bannedIPs: Set<string>
    allowedIPs: Set<string>
    debugLogging: boolean
    disabled: boolean

    constructor()

    debugLog(data: object): void

    banPlayer(player: Player): void

    banSocket(socket: ClientSocket, expirationTime: number): boolean
}