/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
const baseX = parseInt(inputs[0]); // The corner of the map representing your base
const baseY = parseInt(inputs[1]);
const heroesPerPlayer = parseInt(readline()); // Always 3
let eBase = (baseX == 0) ? [17630, 9000] : [0, 0]; //enemy base
let defLine = (baseX == 0) ? [[6480,1609], [3696, 4932], [5312, 3495]] : [[11390, 7207], [14773, 3555], [12587, 5112]];
let pos = (baseX == 0) ? [{x:17557, y:3914}, {x:15012, y:4633}, {x:14030, y:5066}, {x:13126, y:6728}, {x:12617, y:8255}]
                        : [{x:1211, y:4812}, {x:3037, y:3944}, {x:3905, y:3046}, {x:4743, y:1879}, {x:5013, y:921}]; //Attack postion
let p = 2; //Attack postion number
let winded = false;
let follow = false;
// game loop
while (true) {
    //mana & hp per player
    let myMana;
    for (let i = 0; i < 2; i++) {
        var inputs = readline().split(' ');
        const health = parseInt(inputs[0]); // Each player's base health
        const mana = parseInt(inputs[1]); // Ignore in the first league; Spend ten mana to cast a spell
        if (i==0) myMana = mana;
    }

    //entity loop
    let heros = [];
    let spi = [];
    let imp = []; //imposter
    const entityCount = parseInt(readline()); // Amount of heros and monsters you can see
    for (let i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        const id = parseInt(inputs[0]); // Unique identifier
        const type = parseInt(inputs[1]); // 0=monster, 1=your hero, 2=opponent hero
        const x = parseInt(inputs[2]); // Position of this entity
        const y = parseInt(inputs[3]);
        const shieldLife = parseInt(inputs[4]); // Ignore for this league; Count down until shield spell fades
        const isControlled = parseInt(inputs[5]); // Ignore for this league; Equals 1 when this entity is under a control spell
        const health = parseInt(inputs[6]); // Remaining health of this monster
        const vx = parseInt(inputs[7]); // Trajectory of this monster
        const vy = parseInt(inputs[8]);
        const nearBase = parseInt(inputs[9]); // 0=monster with no target yet, 1=monster targeting a base
        const threatFor = parseInt(inputs[10]); // Given this monster's trajectory, is it a threat to 1=your base, 2=your opponent's base, 0=neither
        //entity filtering
        findEnt(type, x, y, id, shieldLife, heros, spi, imp, isControlled, health, threatFor, nearBase, vx, vy);
    }
    
    //Sorting spiders by Distance to base
    spi.sort((a, b) => a.dtb - b.dtb);
    
    //Find closest hero for each mob
    for (let i = 0; i < spi.length; i++) {
        findClosest(i, spi, heros)
    }

    //count of closest mobs to each hero (only closest 3 included)
    let count = [
        {c: 0, t:[]}, 
        {c: 0, t:[]}, 
        {c: 0, t:[]}
    ];
    for (let i = 0; i < spi.length; i++) {
        if (i < 3) {
            if (spi[i].closest == 0) {
                count[0].c++;
                count[0].t.push(spi[i]);
            } else if (spi[i].closest == 1) {
                count[1].c++;
                count[1].t.push(spi[i]);
            } else {
                count[2].c++;
                count[2].t.push(spi[i]);
            }
        }
    }
    let unlisted = []; //spiders that are targets, but can't be atacked by same hero
    for (let i = 0; i < count.length; i++) {
        if (count[i].c == 2) {
            let pt = mid(count[i].t[0].x, count[i].t[0].y, count[i].t[1].x, count[i].t[1].y);
            if (getDistance(pt[0], pt[1], heros[i].x, heros[i].y) > 800 //Distance to mid is reacheable
                || getDistance(count[i].t[0].x, count[i].t[0].y, count[i].t[1].x, count[i].t[1].y) > 1600) {//distance in between small enough to attack
                unlisted.push(count[i].t[1]);
                count[i].t.pop();
                count[i].c--;
            }
        } else if (count[i].c == 3) {
            //next round monsters positions
            let P = [count[i].t[0].x, count[i].t[0].y];
            let Q = [count[i].t[1].x, count[i].t[1].y];
            let R = [count[i].t[2].x, count[i].t[2].y];
            if (!circumClose(P, Q, R)) {
                for (let j = 1; j < 3; j++) {
                    unlisted.push(count[i].t[j]);
                    count[i].t.pop();    
                    count[i].c--;
                }
            }
        }
    }

    //Heros commands 
    for (let i = 0; i < 2; i++) {
        if (count[i].c == 0) {
            if (unlisted.length != 0) {
                if (getDistance(heros[i].x, heros[i].y, unlisted[0].x, unlisted[0].y) < 1280 && unlisted[0].dtb < 4000 
                && myMana >= 10 && unlisted[0].shield == 0) {
                    console.log('SPELL WIND', eBase[0], eBase[1], 'HELP W');
                    myMana = myMana - 10;
                } else {
                    console.log('MOVE', unlisted[0].x, unlisted[0].y, 'HELPING');
                }
            } else {
                console.log('MOVE', defLine[i][0], defLine[i][1], 'AFK');
            }
        } else if (count[i].c == 1) {
            if (getDistance(heros[i].x, heros[i].y, count[i].t[0].x, count[i].t[0].y) < 1280 && count[i].t[0].dtb < 4000 
            && myMana >= 10 && count[i].t[0].shield == 0) {
                console.log('SPELL WIND', eBase[0], eBase[1], 'close W');
                myMana = myMana - 10;
            } else {
                console.log('MOVE', count[i].t[0].x, count[i].t[0].y, 'SOLO');
            }
        } else if (count[i].c == 2) {
            //mid pt next round
            let pt = mid(count[i].t[0].x, count[i].t[0].y, count[i].t[1].x, count[i].t[1].y);
            if (getDistance(heros[i].x, heros[i].y, count[i].t[0].x, count[i].t[0].y) < 1280 && count[i].t[0].dtb < 4000 
            && myMana >= 10 && count[i].t[0].shield == 0) {
                console.log('SPELL WIND', eBase[0], eBase[1], 'MID W'); 
                myMana = myMana - 10;   
            } else {
                console.error(count[i]);
                console.log('MOVE', parseFloat(pt[0].toFixed(0)), parseFloat(pt[1].toFixed(0)), 'MITACK');
            }
        } else {
            if (getDistance(heros[i].x, heros[i].y, count[i].t[0].x, count[i].t[0].y) < 1280 
            && count[i].t[0].dtb < 4000 && myMana >= 10 && count[i].t[0].shield == 0) {
                console.log('SPELL WIND', eBase[0], eBase[1], 'TRIPLE W');  
                myMana = myMana - 10;  
            } else {
                let P = [count[i].t[0].x, count[i].t[0].y];
                let Q = [count[i].t[1].x, count[i].t[1].y];
                let R = [count[i].t[2].x, count[i].t[2].y];                
                let pt = findCircumCenter(P, Q, R);
                console.error("The circumcenter of the triangle PQR is: (", pt[0], ",", pt[1], ")");
                console.log('MOVE', parseFloat(pt[0].toFixed(0)), parseFloat(pt[1].toFixed(0)), 'TRIAD');
            }
        }
    }
    //Attacker code (beta)
    let close = spi.filter(x => x.closest == 2);
    if (getDistance(heros[2].x, heros[2].y, eBase[0], eBase[1]) > 6000) {
        console.log('MOVE', pos[2].x, pos[2].y, 'ATK');
        p = 2;
    } else {
        if (close.length != 0) {
            if (getDistance(heros[2].x, heros[2].y, close[0].x, close[0].y) <= 1280 && close[0].shield == 0) {
                if (myMana >= 10) {
                    winded = true;  
                    console.log('SPELL WIND', eBase[0], eBase[1], 'ATK W');
                } else {
                    winded = false;
                    console.log('MOVE', pos[p].x, pos[p].y, 'PATROL OOM');
                    if (p == 4) {
                        pos.reverse();
                        p = 1;
                    } else {
                        p++;
                    }
                }
            } else if (getDistance(heros[2].x, heros[2].y, close[0].x, close[0].y) <= 2200 && close[0].dte < 3800 
                        && close[0].hp >= 10 && close[0].nb == 1 && close[0].th ==2 && close[0].shield ==0) {
                console.log('SPELL SHIELD', close[0].id, 'shield');
            } else {
                console.log('MOVE', close[0].x, close[0].y, 'see/range');
            }
        } else {
            if (winded || follow) {
                winded = false;
                follow = !follow;
                console.log('MOVE', eBase[0], eBase[1], 'FOLLOWUP');  
            } else {
                winded = false;
                console.log('MOVE', pos[p].x, pos[p].y, 'PATROL');
                if (p == 4) {
                    pos.reverse();
                    p = 1;
                } else {
                    p++;
                }
            }
        }
    }
    
}

function findEnt(type, x, y, id, shieldLife, heros, spi, imp, isControlled, health, th, nb, vx ,vy) {
    if (type == 1) {
        heros.push({  
            x: x,
            y: y,
            id: id,
            shield: shieldLife,
            control: isControlled,
        });
    } else if (type == 0) {
        if (health > 9) phase = 1;
        spi.push({  
            id: id,
            hp: health,
            dtb: distanceBase(x, y),
            dtc: 0,//distance to closest hero
            dte: getDistance(x, y, eBase[0], eBase[1]),//distance to enemy base
            closest: 1000,//filler
            th: th,
            nb: nb,
            x: x,
            y: y,
            shield: shieldLife,
            control: isControlled,
            vx: vx, 
            vy: vy
        });
    } else {
        if (distanceBase(x, y) < 8000) {
            imp.push({  
                x: x,
                y: y,
                id: id,
                shield: shieldLife,
                control: isControlled
            });
        }
    }
}

function mid(x1, y1, x2, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
}
function getDistance(xA, yA, xb, yb) { 
    var xDiff = xA - xb; 
    var yDiff = yA - yb;
    return parseFloat(Math.sqrt(xDiff * xDiff + yDiff * yDiff).toFixed(2));
}

function distanceBase(xA, yA) { 
    let xDiff = xA - baseX; 
    let yDiff = yA - baseY;
    return parseFloat(Math.sqrt(xDiff * xDiff + yDiff * yDiff).toFixed(2));
}

function findClosest(i, spi, heros) {
    let d = getDistance(heros[0].x, heros[0].y, spi[i].x, spi[i].y);
    let h = 0;
    for (let j = 1; j < 3; j++) {
        let temp = getDistance(heros[j].x, heros[j].y, spi[i].x, spi[i].y);
        if (temp < d) {
            d = temp;
            h = j;
        }
    }
    spi[i].closest = h;
    spi[i].dtc = d;
}


function lineFromPoints(P, Q) {
    let a = Q[1] - P[1];
    let b = P[0] - Q[0];
    let c = a*(P[0])+ b*(P[1]);
    return [a, b, c];
}

// Function which converts the input line to its
// perpendicular bisector. It also inputs the points
// whose mid-point lies on the bisector
function perpendicularBisectorFromLine(P, Q, a, b, c) {
    let mid_point = [(P[0] + Q[0])/2, (P[1] + Q[1])/2];

    // c = -bx + ay
    c = -b*(mid_point[0]) + a*(mid_point[1]);

    let temp = a;
    a = -b;
    b = temp;
    return [a, b, c];
}

// Returns the intersection point of two lines
function lineLineIntersection(a1, b1, c1, a2, b2, c2) {
    let determinant = a1*b2 - a2*b1;
    if (determinant == 0)
    {
        // The lines are parallel. This is simplified
        // by returning a pair of FLT_MAX
        return [(10.0)**19, (10.0)**19];
    }

    else
    {
        let x = (b2*c1 - b1*c2)/determinant;
        let y = (a1*c2 - a2*c1)/determinant;
        return [x, y];
    }
}

function findCircumCenter(P, Q, R) {
    // Line PQ is represented as ax + by = c
    let PQ_line = lineFromPoints(P, Q);
    let a = PQ_line[0];
    let b = PQ_line[1];
    let c = PQ_line[2];
    
    // Line QR is represented as ex + fy = g
    let QR_line = lineFromPoints(Q, R);
    let e = QR_line[0];
    let f = QR_line[1];
    let g = QR_line[2];
    
    // Converting lines PQ and QR to perpendicular
    // vbisectors. After this, L = ax + by = c
    // M = ex + fy = g
    let PQ_perpendicular = perpendicularBisectorFromLine(P, Q, a, b, c);
    a = PQ_perpendicular[0];
    b = PQ_perpendicular[1];
    c = PQ_perpendicular[2];
    
    let QR_perpendicular = perpendicularBisectorFromLine(Q, R, e, f, g);
    e = QR_perpendicular[0];
    f = QR_perpendicular[1];
    g = QR_perpendicular[2];
    
    // The point of intersection of L and M gives
    // the circumcenter
    let circumcenter = lineLineIntersection(a, b, c, e, f, g);

    if (circumcenter[0] == (10.0)**19 && circumcenter[1] == (10.0)**19){
        console.error("The two perpendicular bisectors found come parallel");
        return false;
    }
    else{
        return [circumcenter[0], circumcenter[1]];
    }
}
function circumClose (P, Q, R) {
    if (findCircumCenter(P, Q, R)) {
        let circumx = findCircumCenter(P, Q, R)[0];
        let circumy = findCircumCenter(P, Q, R)[1];
        for (let i = 0; i < 3; i++) {
            if (getDistance(arguments[i][0], arguments[i][1], circumx, circumy) > 800) {
                return false;
            }
            return true;
        }
    } else {
        return false
    }
}
