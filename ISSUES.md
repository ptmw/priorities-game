# Issues & Bugs

## 🔴 High Priority

### Cannot Create Room - RLS Policy Blocking Player Creation

**Status:** Open
**Type:** Bug
**Priority:** Critical (blocks all multiplayer functionality)
**Effort:** Low (database policy configuration)

**Summary:**
When attempting to create a new room, the operation fails with error: "new row violates row-level security policy for table 'players'". This completely blocks room creation and all multiplayer functionality.

**Current Behavior:**
- User clicks "Create Room"
- Room creation fails immediately
- Error message: "Failed to create room: new row violates row-level security policy for table 'players'"
- No rooms can be created

**Expected Behavior:**
- Users should be able to create rooms successfully
- Room and initial host player should be created in database

**Root Cause:**
Supabase has Row Level Security (RLS) enabled on the `players` table, but no INSERT policy exists to allow anonymous users to create player records. The app uses the anon key ([lib/supabase.ts:23](lib/supabase.ts#L23)) and relies on RLS policies for security.

**Fix Required:**
Add RLS policies in Supabase dashboard for all multiplayer tables:

```sql
-- Enable RLS (if not already enabled)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can be refined later for security)
-- ROOMS policies
CREATE POLICY "Allow all operations on rooms" ON rooms
  FOR ALL USING (true) WITH CHECK (true);

-- PLAYERS policies
CREATE POLICY "Allow all operations on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

-- ROUNDS policies
CREATE POLICY "Allow all operations on rounds" ON rounds
  FOR ALL USING (true) WITH CHECK (true);
```

**Relevant Files:**
- Supabase database (RLS policies) - **PRIMARY FIX NEEDED**
- [lib/supabase.ts](lib/supabase.ts) - uses anon key, expects RLS policies
- [lib/room-utils.ts:68-86](lib/room-utils.ts#L68-L86) - createRoom function that's failing

**Notes:**
- This blocks ALL multiplayer functionality
- Must be fixed before the 3rd player issue can even be tested
- Current policies are permissive (FOR ALL) - can be tightened later for security
- Consider more restrictive policies once basic functionality works

---

### 3rd Player Cannot Join Room - Database Constraint Blocking at 2 Players

**Status:** Open
**Type:** Bug
**Priority:** High
**Effort:** Low (database migration only)

**Summary:**
When a 3rd player attempts to join a room with 2 existing players, they see an error message and cannot join. The game should support up to 10 players per room.

**Current Behavior:**
- Player 1 and 2 can join successfully
- Player 3 sees error: "Room is full (max 10 players)"
- Player is blocked from joining despite room not actually being at capacity

**Expected Behavior:**
- Up to 10 players should be able to join a room
- Only show "room full" error when truly at 10 connected players

**Root Cause:**
Database CHECK constraint (error code 23514) is being triggered in [lib/room-utils.ts:178](lib/room-utils.ts#L178). The Supabase database has a constraint on the `players` table that limits players per room to 2 instead of 10.

**Fix Required:**
Update the CHECK constraint in Supabase database:

```sql
-- Current constraint likely checks for <= 2 players
-- Should be updated to check for <= 10 players per room
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_per_room_check;
ALTER TABLE players ADD CONSTRAINT players_per_room_check
  CHECK ((SELECT COUNT(*) FROM players WHERE room_id = players.room_id AND is_connected = true) <= 10);
```

**Relevant Files:**
- Supabase database schema (players table constraint) - **PRIMARY FIX NEEDED**
- [lib/room-utils.ts](lib/room-utils.ts) - already handles constraint error correctly ✓
- [types/multiplayer.ts:119](types/multiplayer.ts#L119) - MAX_PLAYERS_PER_ROOM already set to 10 ✓

**Notes:**
- Application-level validation is correct
- Only database constraint needs updating
- No frontend or application code changes needed

---

## 🟡 Normal Priority

<!-- Add more issues here as they come up -->

---

## 🟢 Low Priority / Future Enhancements

<!-- Add enhancement ideas here -->
