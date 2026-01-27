#!/usr/bin/env node

/**
 * Database Fix Verification Script
 *
 * Tests that:
 * 1. RLS policies allow room/player creation
 * 2. Multiple players (3+) can join a room
 * 3. All database operations work correctly
 */

const { createClient } = require('@supabase/supabase-js');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Generate a random room code
function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

async function runTests() {
  log('\n' + '='.repeat(60), 'bold');
  log('DATABASE FIX VERIFICATION', 'bold');
  log('='.repeat(60) + '\n', 'bold');

  // Check environment variables
  logStep(0, 'Checking environment variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logError('Missing environment variables!');
    logWarning('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }

  logSuccess('Environment variables found');
  log(`   URL: ${supabaseUrl.substring(0, 30)}...`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  const testData = {
    roomId: null,
    playerIds: [],
    code: generateRoomCode(),
  };

  try {
    // TEST 1: Create a room
    logStep(1, 'Testing room creation (RLS policy check)...');
    const roomId = crypto.randomUUID();
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        id: roomId,
        code: testData.code,
        host_player_id: 'temp-id', // Will be updated
        status: 'lobby',
        player_score: 0,
        game_score: 0,
        current_round: 0,
        winner: null,
      })
      .select()
      .single();

    if (roomError) {
      logError(`Room creation failed: ${roomError.message}`);
      throw roomError;
    }

    testData.roomId = roomId;
    logSuccess(`Room created with code: ${testData.code}`);

    // TEST 2: Create first player (host)
    logStep(2, 'Testing player creation (RLS policy check - CRITICAL FIX)...');
    const player1Id = crypto.randomUUID();
    const { data: player1, error: player1Error } = await supabase
      .from('players')
      .insert({
        id: player1Id,
        room_id: roomId,
        display_name: 'Test Player 1',
        is_host: true,
        is_connected: true,
      })
      .select()
      .single();

    if (player1Error) {
      logError(`Player 1 creation failed: ${player1Error.message}`);
      logWarning('RLS policy is still blocking player creation!');
      throw player1Error;
    }

    testData.playerIds.push(player1Id);
    logSuccess('Player 1 (host) created successfully');

    // TEST 3: Create second player
    logStep(3, 'Testing second player join...');
    const player2Id = crypto.randomUUID();
    const { data: player2, error: player2Error } = await supabase
      .from('players')
      .insert({
        id: player2Id,
        room_id: roomId,
        display_name: 'Test Player 2',
        is_host: false,
        is_connected: true,
      })
      .select()
      .single();

    if (player2Error) {
      logError(`Player 2 creation failed: ${player2Error.message}`);
      throw player2Error;
    }

    testData.playerIds.push(player2Id);
    logSuccess('Player 2 created successfully');

    // TEST 4: Create third player (THE CRITICAL TEST)
    logStep(4, 'Testing third player join (CRITICAL FIX - was failing before)...');
    const player3Id = crypto.randomUUID();
    const { data: player3, error: player3Error } = await supabase
      .from('players')
      .insert({
        id: player3Id,
        room_id: roomId,
        display_name: 'Test Player 3',
        is_host: false,
        is_connected: true,
      })
      .select()
      .single();

    if (player3Error) {
      logError(`Player 3 creation failed: ${player3Error.message}`);
      logWarning('The 3rd player constraint issue is NOT fixed!');
      logWarning('Error code: ' + player3Error.code);
      throw player3Error;
    }

    testData.playerIds.push(player3Id);
    logSuccess('Player 3 created successfully - 3rd player bug is FIXED! 🎉');

    // TEST 5: Verify player count
    logStep(5, 'Verifying player count in database...');
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select()
      .eq('room_id', roomId);

    if (playersError) {
      logError(`Failed to query players: ${playersError.message}`);
      throw playersError;
    }

    logSuccess(`Found ${players.length} players in room`);
    players.forEach((p, i) => {
      log(`   ${i + 1}. ${p.display_name} (${p.is_host ? 'host' : 'guest'})`);
    });

    // TEST 6: Test round creation
    logStep(6, 'Testing round creation (RLS policy check)...');
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert({
        room_id: roomId,
        round_number: 1,
        picker_id: player1Id,
        guesser_id: player2Id,
        phase: 'picking',
        card_ids: ['test-1', 'test-2', 'test-3', 'test-4', 'test-5'],
      })
      .select()
      .single();

    if (roundError) {
      logError(`Round creation failed: ${roundError.message}`);
      throw roundError;
    }

    logSuccess('Round created successfully');

    // SUCCESS!
    log('\n' + '='.repeat(60), 'bold');
    log('✓ ALL TESTS PASSED!', 'green');
    log('='.repeat(60), 'bold');
    log('\nThe database fixes are working correctly:', 'green');
    log('  ✓ RLS policies allow room creation', 'green');
    log('  ✓ RLS policies allow player creation', 'green');
    log('  ✓ 3+ players can join a room', 'green');
    log('  ✓ Round creation works', 'green');

  } catch (error) {
    log('\n' + '='.repeat(60), 'bold');
    log('✗ TESTS FAILED', 'red');
    log('='.repeat(60), 'bold');
    logError('\nThe database fixes are NOT working correctly.');
    logError('Error: ' + error.message);

    if (error.code) {
      logWarning(`Error code: ${error.code}`);
    }

    if (error.message.includes('row-level security')) {
      logWarning('\nRLS policies are still blocking operations.');
      logWarning('Please verify the SQL commands were run correctly in Supabase.');
    }

    if (error.code === '23514') {
      logWarning('\nCHECK constraint is still limiting players to 2.');
      logWarning('Please verify the constraint was dropped in Supabase.');
    }
  } finally {
    // CLEANUP
    logStep(7, 'Cleaning up test data...');

    if (testData.roomId) {
      // Delete room (should cascade delete players and rounds)
      const { error: cleanupError } = await supabase
        .from('rooms')
        .delete()
        .eq('id', testData.roomId);

      if (cleanupError) {
        logWarning(`Cleanup warning: ${cleanupError.message}`);
        logWarning('You may need to manually delete test data');
      } else {
        logSuccess('Test data cleaned up');
      }
    }

    log('\n');
  }
}

// Run the tests
runTests().catch(error => {
  logError('Unexpected error: ' + error.message);
  process.exit(1);
});
