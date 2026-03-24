import { Instantiator } from "SpectaclesSyncKit.lspkg/Components/Instantiator"
import { SessionController } from "SpectaclesSyncKit.lspkg/Core/SessionController"
import { persistenceTypeFromString } from "SpectaclesSyncKit.lspkg/Core/PersistenceType"
import { SyncKitLogger } from "SpectaclesSyncKit.lspkg/Utils/SyncKitLogger"
import { SyncEntity } from "SpectaclesSyncKit.lspkg/Core/SyncEntity"
import { StorageProperty } from "SpectaclesSyncKit.lspkg/Core/StorageProperty"
import { StorageTypes } from "SpectaclesSyncKit.lspkg/Core/StorageTypes"
const TAG = "FairPrefabAssigner"

/**
 * Assigns one prefab per user who joins.
 *
 * Strategy: maintain a shared bool flag per prefab slot. When a user joins,
 * iterate the flags in order, claim the first unclaimed slot (set it true),
 * and spawn that prefab. Late-joiners naturally get the next available slot.
 *
 * Setup:
 *  1. Add this component to a scene object alongside (or referencing) an Instantiator.
 *  2. Drag the Instantiator into the `instantiator` field.
 *  3. Populate `prefabPool` with the prefabs you want assigned.
 *     These prefabs must also exist in the Instantiator's Prefabs list.
 */
@component
export class FairPrefabAssigner extends BaseScriptComponent {
  /** The Instantiator used to spawn objects across the network. */
  @input
  instantiator: Instantiator

  /**
   * Pool of prefabs to assign. Each slot gets at most one user.
   */
  @input
  prefabPool: ObjectPrefab[]

  @input("string", "Owner")
  @label("Persistence")
  @widget(
    new ComboBoxWidget([
      new ComboBoxItem("Ephemeral", "Ephemeral"),
      new ComboBoxItem("Owner", "Owner"),
      new ComboBoxItem("Session", "Session"),
      new ComboBoxItem("Persist", "Persist"),
    ]),
  )
  private persistenceString = "Owner"

  private log = new SyncKitLogger(TAG)
  private syncEntity: SyncEntity
  // One shared bool flag per prefab slot — false = unclaimed, true = claimed
  private spawnedFlags: StorageProperty<StorageTypes.bool>[] = []
  // Prevents this client from claiming a second slot when other users join later
  private hasClaimedSlot = false

  private onAwake(): void {
    if (!this.instantiator) {
      this.log.e("No Instantiator assigned — FairPrefabAssigner will not run.")
      return
    }

    this.syncEntity = new SyncEntity(this)

    // Create one synced bool per prefab slot
    for (let i = 0; i < this.prefabPool.length; i++) {
      const flag = StorageProperty.manualBool(`prefab_claimed_${i}`, false)
      this.spawnedFlags.push(flag)
      this.syncEntity.addStorageProperty(flag)
    }

    // Wait for sync to be ready, then hook into user join events
    this.syncEntity.notifyOnReady(() => {
      SessionController.getInstance().onUserJoinedSession.add((_session) => {
        if (this.instantiator.isReady()) {
          this.onUserJoined()
        }
      })
    })
  }

  private onUserJoined(): void {
    if (this.prefabPool.length === 0) {
      this.log.w("prefabPool is empty — nothing to assign.")
      return
    }

    const myId = SessionController.getInstance().getLocalUserInfo()?.connectionId ?? "unknown"

    if (this.hasClaimedSlot) {
      print(`[FairPrefabAssigner] ${myId}: already has a slot, skipping.`)
      return
    }

    const flagSnapshot = this.spawnedFlags
      .map((f, i) => `slot${i}=${f.currentOrPendingValue}`)
      .join(", ")
    print(`[FairPrefabAssigner] onUserJoined fired for local user: ${myId}`)
    print(`[FairPrefabAssigner] Flag state at time of check: ${flagSnapshot}`)

    // Find the first unclaimed slot and claim it
    for (let i = 0; i < this.spawnedFlags.length; i++) {
      const isClaimed = this.spawnedFlags[i].currentOrPendingValue
      print(`[FairPrefabAssigner] Checking slot ${i}: claimed=${isClaimed}`)
      if (!isClaimed) {
        this.hasClaimedSlot = true
        this.spawnedFlags[i].setPendingValue(true)

        const assignedPrefab = this.prefabPool[i]
        print(`[FairPrefabAssigner] ${myId} claiming slot ${i}: "${assignedPrefab.name}"`)

        this.instantiator.instantiate(assignedPrefab, {
          overrideNetworkId: `fair_assigned_${i}`,
          claimOwnership: true,
          persistence: persistenceTypeFromString(this.persistenceString),
        })
        return
      }
    }

    print(`[FairPrefabAssigner] ${myId}: all slots claimed, no prefab assigned.`)
  }
}
