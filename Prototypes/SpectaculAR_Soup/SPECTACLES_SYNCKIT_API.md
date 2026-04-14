# SpectaclesSyncKit API Reference
> Reconstructed from source — all definitions from the `.lspkg` package scripts.

---

## Table of Contents
1. [SyncEntity](#syncentity)
2. [SessionController](#sessioncontroller)
3. [StorageProperty](#storageproperty)
4. [StoragePropertySet](#storagepropertyset)
5. [StorageTypes (enum)](#storagetypes-enum)
6. [EventWrapper](#eventwrapper)
7. [KeyedEventWrapper](#keyedeventwrapper)
8. [NetworkMessage](#networkmessage)
9. [EntityEventWrapper](#entityeventwrapper)
10. [NetworkRootInfo](#networkrootinfo)
11. [StoreEventWrapper](#storeeventwrapper)
12. [Instantiator (Component)](#instantiator-component)
13. [SyncTransform (Component)](#synctransform-component)
14. [SyncRealtimeStore (Component)](#syncrealtimestore-component)
15. [Enums & Type Helpers](#enums--type-helpers)

---

## SyncEntity
**File:** `Core/SyncEntity.ts`

The central class. Bridges a ScriptComponent to a networked `GeneralDataStore` (RealtimeStore). Most networked scripts create one of these.

### Constructor
```ts
new SyncEntity(
  scriptComponent: ScriptComponent,
  propertySet?: StoragePropertySet,   // set of StorageProperties to auto-sync
  claimOwnership?: boolean,           // claim ownership on creation
  persistence?: RealtimeStoreCreateOptions.Persistence | keyof typeof RealtimeStoreCreateOptions.Persistence | null,
  networkIdOptions?: NetworkIdOptions // defaults to script's own hierarchy/objectId
)
```

### Static Factory
```ts
SyncEntity.createStandalone(
  networkId: string,
  propertySet?: StoragePropertySet,
  claimOwnership?: boolean,
  persistence?: ...
): SyncEntity
// Creates a SyncEntity not tied to any ScriptComponent.
```

### Properties
| Property | Type | Description |
|---|---|---|
| `networkId` | `string` | Unique ID used to identify this SyncEntity across the network |
| `currentStore` | `GeneralDataStore` | The RealtimeStore backing this entity. `null` until setup finishes |
| `ownerInfo` | `ConnectedLensModule.UserInfo` | Owner's UserInfo, or `null` if unowned |
| `persistence` | `RealtimeStoreCreateOptions.Persistence` | Persistence setting |
| `networkRoot` | `NetworkRootInfo \| null` | Instantiation info if spawned via Instantiator |
| `propertySet` | `StoragePropertySet` | Holds all StorageProperties managed by this entity |
| `isSetupFinished` | `boolean` | `true` once the store is ready |
| `destroyed` | `boolean` | `true` if destroyed |
| `localScript` | `NetworkedScriptComponent` | The attached ScriptComponent |
| `storeCallbacks` | `StoreEventWrapper` | Direct access to store lifecycle events |
| `messaging` | `NetworkMessageWrapper` | Access to network message sending/receiving |

### Events
| Event | Signature | Description |
|---|---|---|
| `onSetupFinished` | `EventWrapper<[void]>` | Fires when store is ready |
| `onOwnerUpdated` | `EventWrapper<[UserInfo]>` | Fires when owner changes |
| `onDestroyed` | `EventWrapper<[void]>` | Fires on destroy (local or remote) |
| `onLocalDestroyed` | `EventWrapper<[void]>` | Fires when destroyed by local user |
| `onRemoteDestroyed` | `EventWrapper<[void]>` | Fires when destroyed by remote user |
| `onEventReceived` | `KeyedEventWrapper<[NetworkMessage]>` | Fires on any network event (including local) |
| `onRemoteEventReceived` | `KeyedEventWrapper<[NetworkMessage]>` | Fires only for remote-originated events |

### Methods
```ts
// Wait for ready — fires callback immediately if already ready
notifyOnReady(onReady: () => void): void

// Ownership
canIModifyStore(): boolean     // true if local user can write (unowned or owned by local)
doIOwnStore(): boolean         // true if local user owns the store
isStoreOwned(): boolean        // true if any user owns the store
getOwnerId(): string | null    // connectionId of owner
getOwnerUserId(): string | null
getOwnerConnectionId(): string | null

tryClaimOwnership(onSuccess?: (store) => void, onError?: (err) => void): void
tryRevokeOwnership(onSuccess?: (store) => void, onError?: (err) => void): void
requestOwnership(onSuccess?: (store) => void, onError?: (err) => void): void

// StorageProperty management
addStorageProperty<T>(storageProperty: StorageProperty<T>): StorageProperty<T>

// Messaging
sendEvent(eventName: string, eventData?: unknown, onlySendRemote?: boolean): void
getEntityEventWrapper<T>(eventName: string): EntityEventWrapper<T>

// Session helpers
getSessionController(): SessionController
getSession(): MultiplayerSession | null

// Destruction
destroy(): void

// Static lookups
static getSyncEntityOnComponent(component: Component): SyncEntity | null
static getSyncEntityOnSceneObject(sceneObject: SceneObject): SyncEntity | null
static findById(networkId: string): SyncEntity | null
```

---

## SessionController
**File:** `Core/SessionController.ts`
**Pattern:** Singleton — access via `SessionController.getInstance()`

Manages the ConnectedLens multiplayer session lifecycle.

### Events
| Event | Signature |
|---|---|
| `onReady` | `EventWrapper<[]>` |
| `onSessionCreated` | `EventWrapper<[MultiplayerSession, SessionCreationType]>` |
| `onSessionShared` | `EventWrapper<[MultiplayerSession]>` |
| `onConnected` | `EventWrapper<[MultiplayerSession, ConnectionInfo]>` |
| `onDisconnected` | `EventWrapper<[MultiplayerSession, string]>` |
| `onUserJoinedSession` | `EventWrapper<[MultiplayerSession, UserInfo]>` |
| `onUserLeftSession` | `EventWrapper<[MultiplayerSession, UserInfo]>` |
| `onHostUpdated` | `EventWrapper<[MultiplayerSession, HostUpdateInfo]>` |
| `onMessageReceived` | `EventWrapper<[session, userId, message, senderInfo]>` |
| `onError` | `EventWrapper<[session, code, description]>` |
| `onConnectionFailed` | `EventWrapper<[code, description]>` |
| `onRealtimeStoreCreated` | `EventWrapper<[session, store, ownerInfo, creationInfo]>` |
| `onRealtimeStoreUpdated` | `EventWrapper<[session, store, key, updateInfo]>` |
| `onRealtimeStoreDeleted` | `EventWrapper<[session, store, deleteInfo]>` |
| `onRealtimeStoreOwnershipUpdated` | `EventWrapper<[session, store, ownerInfo, updateInfo]>` |
| `onLocatedAtFound` | `EventWrapper<[]>` |
| `onStartColocated` | `EventWrapper<[]>` |
| `onMapExists` | `EventWrapper<[]>` |

### Key Methods
```ts
// Lifecycle
notifyOnReady(onReady: () => void): void     // fires immediately if already ready
getIsReady(): boolean
init(): void                                  // call to begin session setup

// Session
getSession(): MultiplayerSession | null
getMappingSession(): MappingSession | null
getServerTimeInSeconds(): number | null       // unix timestamp in seconds from server
shareInvite(): void
getSessionCreationType(): ConnectedLensSessionOptions.SessionCreationType

// Local user
getLocalUserId(): string | null
getLocalConnectionId(): string | null
getLocalUserName(): string | null
getLocalUserInfo(): ConnectedLensModule.UserInfo
isSameUserAsLocal(userInfo: UserInfo): boolean
isLocalUserConnection(userInfo: UserInfo): boolean

// Host
isHost(): boolean | null
getHostUserId(): string | null
getHostConnectionId(): string | null
getHostUserName(): string | null
getHostUserInfo(): ConnectedLensModule.UserInfo
isSameUserAsHost(userInfo: UserInfo): boolean
isHostUserConnection(userInfo: UserInfo): boolean

// Users
getUsers(): ConnectedLensModule.UserInfo[]
getUserByConnectionId(connectionId: string): UserInfo | null
getUsersByUserId(userId: string): UserInfo[]

// Store management
getStoreInfoById(networkId: string): StoreInfo | null
getTrackedStores(): StoreInfo[]
createStore(
  storeOptions: RealtimeStoreCreateOptions,
  onSuccess?: (store: GeneralDataStore) => void,
  onError?: (message: string) => void
): void
getSessionStore(): GeneralDataStore | null

// Colocated
notifyOnStartColocated(callback: () => void): void
notifyOnLocatedAtFound(callback: () => void): void
notifyOnMapExists(callback: () => void): void
getMapExists(): boolean
getLocatedAtComponent(): LocatedAtComponent
getDeviceTrackingComponent(): DeviceTracking
getLocationCloudStorageModule(): LocationCloudStorageModule
```

---

## StorageProperty
**File:** `Core/StorageProperty.ts`

Represents a single synced value in a RealtimeStore. Handles reading, writing, smoothing, and events.

### Constructor
```ts
new StorageProperty<TStorageType>(
  key: string,            // store key; must be unique within the SyncEntity
  propertyType: TStorageType,  // use StorageTypes enum
  smoothingOptions?: SnapshotBufferOptions<TStorageType>
)
```

### Key Instance Properties
| Property | Type | Description |
|---|---|---|
| `key` | `string` | The store key |
| `propertyType` | `StorageTypes` | The value type |
| `currentValue` | `T \| null` | The current synced value |
| `pendingValue` | `T \| null` | Local value pending send |
| `currentOrPendingValue` | `T \| null` | Most recent local value (use this for UI) |
| `getterFunc` | `(() => T) \| null` | If set, auto-reads each frame |
| `setterFunc` | `((v: T) => void) \| null` | If set, auto-applies remote values |
| `sendsPerSecondLimit` | `number` | Rate limiting (-1 = unlimited, 0 = never) |
| `markedDirty` | `boolean` | Force-send on next frame even if value is "equal" |
| `needToSendUpdate` | `boolean` | Internal flag indicating pending write |

### Events
| Event | Args | Description |
|---|---|---|
| `onAnyChange` | `(newVal, prevVal, updateInfo\|null)` | Any change (local or remote) |
| `onLocalChange` | `(newVal, prevVal)` | Changed locally |
| `onRemoteChange` | `(newVal, prevVal, updateInfo)` | Changed by remote user |
| `onPendingValueChange` | `(newVal, prevVal)` | Pending value updated |

### Key Instance Methods
```ts
setPendingValue(newValue: T): void         // queue a value to send
setValueImmediate(store, newValue): boolean // write immediately (only if you own the store)
silentSetCurrentValue(newValue: T): void   // set without triggering events
checkLocalValueChanged(): boolean
checkWithinSendLimit(timestamp: number): boolean
isSmoothingEnabled(): boolean
applySnapshotSmoothing(): void
```

### Static Factory Methods — Manual (set value yourself via `setPendingValue`)
```ts
StorageProperty.manual<T>(key, propertyType, startingValue?, smoothingOptions?): StorageProperty<T>

// Typed shortcuts:
StorageProperty.manualBool(key, startingValue?): StorageProperty<bool>
StorageProperty.manualInt(key, startingValue?): StorageProperty<int>
StorageProperty.manualFloat(key, startingValue?, smoothingOptions?): StorageProperty<float>
StorageProperty.manualDouble(key, startingValue?, smoothingOptions?): StorageProperty<double>
StorageProperty.manualString(key, startingValue?): StorageProperty<string>
StorageProperty.manualVec2(key, startingValue?, smoothingOptions?): StorageProperty<vec2>
StorageProperty.manualVec3(key, startingValue?, smoothingOptions?): StorageProperty<vec3>
StorageProperty.manualVec4(key, startingValue?, smoothingOptions?): StorageProperty<vec4>
StorageProperty.manualQuat(key, startingValue?, smoothingOptions?): StorageProperty<quat>
StorageProperty.manualMat2 / manualMat3 / manualMat4(key, startingValue?, smoothingOptions?)
StorageProperty.manualBoolArray / manualIntArray / manualFloatArray / manualDoubleArray(key, startingValue?)
StorageProperty.manualStringArray / manualVec2Array / manualVec3Array / manualVec4Array(key, startingValue?)
StorageProperty.manualQuatArray / manualMat2Array / manualMat3Array / manualMat4Array(key, startingValue?)
```

### Static Factory Methods — Auto (getter/setter functions called every frame)
```ts
StorageProperty.auto<T>(key, propertyType, getterFunc, setterFunc, smoothingOptions?): StorageProperty<T>

// Typed shortcuts:
StorageProperty.autoBool(key, getter, setter): StorageProperty<bool>
StorageProperty.autoInt(key, getter, setter): StorageProperty<int>
StorageProperty.autoFloat(key, getter, setter, smoothingOptions?): StorageProperty<float>
StorageProperty.autoString(key, getter, setter): StorageProperty<string>
StorageProperty.autoVec2/autoVec3/autoVec4/autoQuat(key, getter, setter, smoothingOptions?)
```

### Static Factory — Transform Sync
```ts
StorageProperty.forTransform(
  permissiveTransform: Transform | SceneObject | Component,
  positionPropertyType: PropertyType,   // PropertyType.None/Local/World/Location
  rotationPropertyType: PropertyType,
  scalePropertyType: PropertyType,
  smoothingOptions?: SnapshotBufferOptions<StorageTypes.packedTransform>
): StorageProperty<StorageTypes.packedTransform>
// Returns a packedTransform property auto-syncing position/rotation/scale.
```

### Static Helper
```ts
StorageProperty.getStoreValueDynamic<T>(store, key, propertyType): T
```

---

## StoragePropertySet
**File:** `Core/StoragePropertySet.ts`

Container for multiple `StorageProperty` instances. The `SyncEntity` uses one to batch-sync all properties.

### Constructor
```ts
new StoragePropertySet(properties?: StorageProperty<any>[])
```

### Methods
```ts
addProperty<T>(property: StorageProperty<T>): StorageProperty<T>
getProperty<T>(propertyKey: string): StorageProperty<T> | null
forceWriteState(store: GeneralDataStore): void
sendChanges(store: GeneralDataStore, serverTime: number): boolean
receiveChanges(): void
sendAndReceiveChanges(store: GeneralDataStore, serverTime: number): boolean
initializeFromStore(store: GeneralDataStore, dontTriggerEvents?: boolean): void
applyKeyUpdate(store, key, initialValue?, dontTriggerEvents?, updateInfo?): void
```

---

## StorageTypes (enum)
**File:** `Core/StorageTypes.ts`

Used as the `propertyType` argument for `StorageProperty`.

```ts
enum StorageTypes {
  bool, float, double, int, string,
  vec2, vec3, vec4, quat,
  mat2, mat3, mat4,
  boolArray, floatArray, doubleArray, intArray, stringArray,
  vec2Array, vec3Array, vec4Array, quatArray,
  mat2Array, mat3Array, mat4Array,
  packedTransform  // used by StorageProperty.forTransform()
}
```

**Type mapping** (`StorageTypeToPrimitive`):
- `bool` → `boolean`
- `int/float/double` → `number`
- `string` → `string`
- `vec2/3/4` → `vec2/3/4`
- `quat` → `quat`
- `mat2/3/4` → `mat2/3/4`
- Array variants → JS arrays of the above
- `packedTransform` → `vec4[]`

---

## EventWrapper
**File:** `Core/EventWrapper.ts`

Simple typed event bus.

```ts
class EventWrapper<T extends unknown[]> {
  add(callback: (...args: T) => void): (...args: T) => void
  remove(callback: (...args: T) => void): void
  trigger(...args: T): void
}
```

**Example:**
```ts
syncEntity.onSetupFinished.add(() => { /* ready */ })
```

---

## KeyedEventWrapper
**File:** `Core/KeyedEventWrapper.ts`

Like `EventWrapper` but subscribers are filtered by a string key. Used for network event routing.

```ts
class KeyedEventWrapper<T extends unknown[]> {
  add(key: string, callback: (...args: T) => void): (...args: T) => void
  remove(key: string, callback: (...args: T) => void): void
  addAny(callback: (key: string, ...args: T) => void): (key, ...args) => void
  removeAny(callback): void
  trigger(key: string, ...args: T): void
  getWrapper(key: string, createIfMissing?: boolean): EventWrapper<T> | null
}
```

---

## NetworkMessage
**File:** `Core/NetworkMessage.ts`

Payload received when a network event fires.

```ts
class NetworkMessage<T> {
  senderUserId: string
  senderConnectionId: string
  message: string        // the event name
  data: T                // the event data
  senderInfo: ConnectedLensModule.UserInfo
}
```

---

## EntityEventWrapper
**File:** `Core/SyncEntity.ts`

Helper wrapping send/receive for a single named event on a `SyncEntity`.

```ts
class EntityEventWrapper<T> {
  onEventReceived: EventWrapper<[NetworkMessage<unknown>]>       // local + remote
  onRemoteEventReceived: EventWrapper<[NetworkMessage<unknown>]> // remote only
  send(data?: T, onlySendRemote?: boolean): void
}
```

**Usage:**
```ts
const myEvent = syncEntity.getEntityEventWrapper<{score: number}>("ScoreUpdated")
myEvent.onRemoteEventReceived.add((msg) => print(msg.data.score))
myEvent.send({ score: 42 })
```

---

## NetworkRootInfo
**File:** `Core/NetworkRootInfo.ts`

Attached to the root holder object when a prefab is instantiated via `Instantiator`. Accessible via `syncEntity.networkRoot`.

### Constructor (internal)
```ts
new NetworkRootInfo(
  sceneObject: SceneObject,
  networkId: string,
  dataStore: GeneralDataStore,
  locallyCreated: boolean,
  ownerInfo: ConnectedLensModule.UserInfo | null,
  permissivePersistence?: RealtimeStoreCreateOptions.Persistence
)
```

### Properties
| Property | Type | Description |
|---|---|---|
| `sceneObject` | `SceneObject` | Root holder object |
| `instantiatedObject` | `SceneObject` | The actual spawned prefab child |
| `networkId` | `string` | Network ID of this instance |
| `dataStore` | `GeneralDataStore` | Backing store |
| `locallyCreated` | `boolean` | `true` if spawned locally in this session |
| `ownerInfo` | `UserInfo \| null` | Owner at creation |
| `persistence` | `Persistence` | Persistence type |
| `callbacks` | `StoreEventWrapper` | Store lifecycle events |

### Events
```ts
onDestroyed: EventWrapper<[]>         // local or remote
onLocalDestroyed: EventWrapper<[]>
onRemoteDestroyed: EventWrapper<[]>
```

### Methods
```ts
getOwnerUserId(): string | null
getOwnerId(): string | null
isOwnedBy(connectionId: string): boolean
isOwnedByUserInfo(user: UserInfo): boolean
canIModifyStore(): boolean
doIOwnStore(): boolean
```

---

## StoreEventWrapper
**File:** `Core/StoreEventWrapper.ts`

Wraps `SessionController` global store events, filtering to a specific `networkId`.

```ts
class StoreEventWrapper {
  networkId: string

  onStoreCreated: EventWrapper<[session, store, ownerInfo, creationInfo]>
  onStoreUpdated: EventWrapper<[session, store, key, updateInfo]>
  onStoreOwnershipUpdated: EventWrapper<[session, store, ownerInfo, updateInfo]>
  onStoreDeleted: EventWrapper<[session, store, deleteInfo]>
  onStoreKeyRemoved: EventWrapper<[session, store, removalInfo]>

  cleanup(): void
}
```

---

## Instantiator (Component)
**File:** `Components/Instantiator.ts`

Attach to a SceneObject to spawn networked prefab instances. Prefabs must be registered in the Inspector.

### Inspector Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `prefabs` | `ObjectPrefab[]` | — | Prefabs available for `instantiate()` |
| `spawnerOwnsObject` | `boolean` | `false` | Auto-claim ownership on spawn |
| `spawnAsChildren` | `boolean` | `false` | Spawn under parent object |
| `spawnUnderParent` | `SceneObject` | — | Parent override when `spawnAsChildren` is true |
| `autoInstantiate` | `boolean` | `false` | Spawn listed prefabs on session ready |
| `autoInstantiatePrefabs` | `ObjectPrefab[]` | — | Auto-spawned prefabs |
| `persistenceString` | `"Ephemeral"\|"Owner"\|"Session"\|"Persist"` | `"Session"` | Persistence for auto-instances |
| `autoInstantiateOwnershipString` | `"Owned"\|"Unowned"` | `"Unowned"` | Ownership for auto-instances |

### Methods
```ts
instantiate(
  prefab: ObjectPrefab,
  options?: InstantiationOptions | InstantiationOptionsObj,
  onSuccess?: (networkRoot: NetworkRootInfo) => void
): void

isReady(): boolean
notifyOnReady(onReady: () => void): void
```

### InstantiationOptions
```ts
type InstantiationOptionsObj = {
  onSuccess?: (networkRoot: NetworkRootInfo) => void
  persistence?: RealtimeStoreCreateOptions.Persistence | keyof typeof ...
  claimOwnership?: boolean
  worldPosition?: vec3
  worldRotation?: quat
  worldScale?: vec3
  localPosition?: vec3
  localRotation?: quat
  localScale?: vec3
  onError?: (message: string) => void
  overrideNetworkId?: string        // specify a deterministic network ID
  customDataStore?: GeneralDataStore
}
```

---

## SyncTransform (Component)
**File:** `Components/SyncTransform.ts`

Attach to a SceneObject to sync its position/rotation/scale automatically. Configurable from Inspector.

### Inspector Inputs
| Input | Type | Default | Description |
|---|---|---|---|
| `networkIdTypeString` | `"objectId"\|"custom"` | `"objectId"` | Network ID strategy |
| `customNetworkId` | `string` | — | Used when `networkIdType = "custom"` |
| `positionSyncString` | `"None"\|"Location"\|"Local"\|"World"` | `"Location"` | Position sync space |
| `rotationSyncString` | `"None"\|"Location"\|"Local"\|"World"` | `"Location"` | Rotation sync space |
| `scaleSyncString` | `"None"\|"Location"\|"Local"\|"World"` | `"Location"` | Scale sync space |
| `persistenceString` | `"Ephemeral"\|"Owner"\|"Session"\|"Persist"` | `"Session"` | Persistence |
| `sendsPerSecondLimit` | `number` | `10` | Network rate limit |
| `useSmoothing` | `boolean` | `false` | Enable snapshot interpolation |
| `interpolationTarget` | `number` | `-0.25` | Interpolation lag offset (seconds) |

### Public Property
```ts
readonly syncEntity: SyncEntity  // the backing SyncEntity
```

---

## SyncRealtimeStore (Component)
**File:** `Components/SyncRealtimeStore.ts`

Lightweight wrapper — just exposes a networked store with no built-in behavior. Useful for custom synced data.

### Public Properties / Events
```ts
readonly syncEntity: SyncEntity
onStoreCreated  // delegates to syncEntity.storeCallbacks.onStoreCreated
onStoreUpdated
onStoreOwnershipUpdated
onStoreDeleted
onSetupFinished
onOwnerUpdated
```

### Methods
```ts
isStoreReady(): boolean
getStore(): GeneralDataStore | null
getStoreOwnerInfo(): ConnectedLensModule.UserInfo | null
canIModifyStore(): boolean
doIOwnStore(): boolean
isStoreOwned(): boolean
addStorageProperty<T>(storageProperty: StorageProperty<T>): StorageProperty<T>
```

---

## Enums & Type Helpers

### NetworkIdType
**File:** `Core/NetworkIdType.ts`
```ts
enum NetworkIdType {
  Hierarchy,  // generated from scene hierarchy path
  Custom,     // uses a manually specified string
  ObjectId    // uses the SceneObject's unique ID
}
```

### PropertyType
**File:** `Core/PropertyType.ts`
Used to specify which transform space to sync.
```ts
enum PropertyType {
  None,
  Local,    // local space (relative to parent)
  World,    // world space
  Location  // location space (relative to colocated anchor)
}
```

### RealtimeStoreCreateOptions.Persistence (Lens Studio built-in)
Passed as `persistence` parameter throughout:
```
Ephemeral  — deleted when the creating user leaves
Owner      — persists while any user connected; deleted when last user leaves
Session    — persists for the session duration
Persist    — persists indefinitely across sessions
```

### RealtimeStoreCreateOptions.Ownership (Lens Studio built-in)
```
Owned    — creating user owns it immediately
Unowned  — no owner; anyone can write
```

---

## Common Patterns

### Creating a synced variable
```ts
// Manual (you call setPendingValue to update)
const myProp = StorageProperty.manualString("myKey", "initial")
const propSet = new StoragePropertySet([myProp])
const syncEntity = new SyncEntity(this, propSet, true, "Session")

syncEntity.notifyOnReady(() => {
  myProp.setPendingValue("hello world")
})

myProp.onRemoteChange.add((newVal, prevVal) => {
  print("Remote changed to: " + newVal)
})
```

### Sending a network event
```ts
const evt = syncEntity.getEntityEventWrapper<{action: string}>("GameEvent")
evt.onRemoteEventReceived.add((msg) => { /* handle */ })
evt.send({ action: "start" })
// or: syncEntity.sendEvent("GameEvent", { action: "start" }, true)
```

### Spawning a networked prefab
```ts
// instantiator is a reference to an Instantiator component
instantiator.instantiate(myPrefab, {
  claimOwnership: true,
  persistence: "Session",
  worldPosition: new vec3(0, 0, 0),
  onSuccess: (networkRoot) => {
    // networkRoot.instantiatedObject is the spawned SceneObject
  }
})
```

### Checking if local user is host
```ts
SessionController.getInstance().notifyOnReady(() => {
  if (SessionController.getInstance().isHost()) {
    // do host-only logic
  }
})
```
