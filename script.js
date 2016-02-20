var can = document.getElementById('canvas');
var canvas = document.getElementById('canvas').getContext('2d');
canvas.strokeStyle = '#E1E1E1';
canvas.fillStyle = '#00A2EF';
var cells = [];
var updateSpeed = 50;
var totalAlive = 1;
var totalLastAlive = 1;
var audio = new AudioContext();

init();

function init() {

    can.addEventListener("mousedown", "doMouseDown", false);

    for (var i=0; i<64; i++) {
        cells[i] = [];
        for (var j=0; j<64; j++) {
            cells[i][j] = 0;
        }
    }
    
    // Prefilled cells
    [
        // Gosper glider gun
        [1, 5],[1, 6],[2, 5],[2, 6],[11, 5],[11, 6],[11, 7],[12, 4],[12, 8],[13, 3],[13, 9],[14, 3],[14, 9],[15, 6],[16, 4],[16, 8],[17, 5],[17, 6],[17, 7],[18, 6],[21, 3],[21, 4],[21, 5],[22, 3],[22, 4],[22, 5],[23, 2],[23, 6],[25, 1],[25, 2],[25, 6],[25, 7],[35, 3],[35, 4],[36, 3],[36, 4],
        
        // Random cells
        // If you wait enough time these will eventually take part
        // in destroying the glider gun, and the simulation will be in a "static" state.
        [60, 47],[61,47],[62,47],
        [60, 48],[61,48],[62,48],
        [60, 49],[61,49],[62,49],
        [60, 51],[61,51],[62,51],
    ]
    .forEach(function(point) {
        cells[point[0]][point[1]] = 1;
    });
    
    update();
}

function createOscillator(freq) {
    var attack = 10,
        decay = 250,
        gain = audio.createGain(),
        osc = audio.createOscillator();

    gain.connect(audio.destination);
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
    gain.gain.linearRampToValueAtTime(0, audio.currentTime + decay / 1000);

    osc.frequency.value = freq;
    osc.type = "square";
    osc.connect(gain);
    osc.start(0);

    setTimeout(function() {
        osc.stop(0);
        osc.disconnect(gain);
        gain.disconnect(audio.destination);
    }, decay)
}

function update() {
    totalAlive = 0;
    var result = [];
    
    function _countNeighbours(x, y) {
        var amount = 0;
        
        function _isFilled(x, y) {
            return cells[x] && cells[x][y];
        }
        
        if (_isFilled(x-1, y-1)) amount++;
        if (_isFilled(x,   y-1)) amount++;
        if (_isFilled(x+1, y-1)) amount++;
        if (_isFilled(x-1, y  )) amount++;
        if (_isFilled(x+1, y  )) amount++;
        if (_isFilled(x-1, y+1)) amount++;
        if (_isFilled(x,   y+1)) amount++;
        if (_isFilled(x+1, y+1)) amount++;
        
        return amount;
    }
    
    cells.forEach(function(row, x) {
        result[x] = [];
        row.forEach(function(cell, y) {
            var alive = 0,
                count = _countNeighbours(x, y);
            
            if (cell > 0) {
                alive = count === 2 || count === 3 ? 1 : 0;
            } else {
                alive = count === 3 ? 1 : 0;
            }
            
            result[x][y] = alive;
            if(alive === 1) {
                totalAlive++;
            }
        });
    });
    
    cells = result;
    createOscillator(totalAlive * 4);
    draw();
}

function doMouseDown(event) {
    var canvasX = event.pageX;
    var canvasY = event.pageY;
    console.log(canvasX + ", " + canvasY);
}

function draw() {
    canvas.clearRect(0, 0, 4000, 4000);
    cells.forEach(function(row, x) {
        row.forEach(function(cell, y) {
            canvas.beginPath();
            canvas.rect(x * 10, y * 10, 10, 10);
            if (cell) {
                canvas.fill();
            } else {
                canvas.stroke();
            }
        });
    });
    setTimeout(function() {update();}, updateSpeed);
}