Array.prototype.removeChunk = function(x, z) {
    this.forEach(function (chunk, index) {
	if (chunk.x == x && chunk.z == z) {
	    chunk.x = null;
	    chunk.z = null;
	    return true;
	}
    });
}

var Unsupported = require('../lib/unsupported.js');
var Redstone = require('../lib/redstone.js');

// Array.removeChunk(chunk.x, .z);
// Remove a chunk from an array of chunks, if it exists.
module.exports = function() {
    return function(game) {
	game.on("player:join", function(player) {
	    
	    player.client.on("packet:0f", function(packet) {
		
		var tmp_x = packet.x,
		tmp_z = packet.z,
		tmp_y = packet.y;
		
		switch(packet.direction) {
		case 0: {
		    tmp_y -= 1;
		    break;
		}
		case 1: {
		    tmp_y += 1;
		    break;
		}
		case 2: {
		    tmp_z -= 1;
		    break;
		}
		case 3: {
		    tmp_z += 1;
		    break;
		}
		case 4: {
		    tmp_x -= 1;
		    break;
		}
		case 5: {
		    tmp_x += 1;
		    break;
		}
		}
		
		var chunk_x = tmp_x >> 4,
		chunk_z = tmp_z >> 4;
		
		var block_x = tmp_x & 0x0f,
		block_z = tmp_z & 0x0f,
		block_y = tmp_y;
		
		game.map.get_abs_chunk(packet.x, packet.z, function(err, chunk) {
		    if (chunk.protection.active && chunk.protection.owner == player.name) {
			if (packet.slot.block == 331) {
                            chunk.set_block_type(block_x, block_z, block_y, 55);
			    chunk.set_block_meta(block_x, block_z, block_y, 0);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 55, metadata: 0})
                            });
                            Redstone.update(block_x, block_y, block_z, chunk, game);
                        }
			if (packet.slot.block == 76) {
                            Redstone.updateOn(block_x, block_z, block_y, chunk, game);
			    chunk.set_block_type(block_x, block_z, block_y, 76);
			    game.clients.forEach(function(client) {
				client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 76, metadata: 0})
			    });
                        }
                        if (packet.slot.block == 46) {
                            player.message('§4Removing ownership of chunk ' + chunk.x + ', ' + chunk.z);
			    player.save.protection.chunks.removeChunk(chunk.x, chunk.z);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        }
			if (packet.slot.block == 326) {
                            chunk.set_block_type(block_x, block_z, block_y, 9);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 9, metadata: 0})
                            });
			}
                        if (packet.slot.block == 327) {
                            chunk.set_block_type(block_x, block_z, block_y, 11);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 9, metadata: 0})
                            });
                        }
			if (packet.slot.block == -1) {
                            player.message('§2Chunk ' + chunk.x + ',' + chunk.z);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        }
        		if (Unsupported.checkForBlock(packet.slot.block) == false) {
			    player.message('§4The item you (may have) tried to place is unsupported.');
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        }
                        else {
                            if (!Unsupported.checkForBlock(packet.slot.block) && packet.slot.block != -1 && packet.slot.block != 383 && packet.slot.block != 326 && packet.slot.block != 327 && packet.slot.block != 84 && packet.slot.block != 7 && packet.slot.block != 331) {
                                chunk.set_block_type(block_x, block_z, block_y, packet.slot.block);
                                chunk.set_block_type(chunk.x, chunk.z, 1, 152);
                                game.clients.forEach(function(client) {
				    client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: packet.slot.block, metadata: 0})
                                });
			    }
                        }
                    }
                    else {
			if (packet.slot.block == 7) {
			    player.message('§2You now own chunk ' + chunk.x + ', ' + chunk.z);
			    player.save.protection.chunks.push({x: chunk.x, z: chunk.z});
			    chunk.protection.active = true;
			    chunk.protection.owner = player.name;
			    game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
			}
			else {
                            player.message('§4You do not own chunk ' + chunk.x + ', ' + chunk.z);
                            game.clients.forEach(function(client) {
                                client.emit("data", {pid: 0x35, x: tmp_x, y: tmp_y, z: tmp_z, type: 0, metadata: 0})
                            });
                        } 
                    }
		});
	    });
	});
    };
};
