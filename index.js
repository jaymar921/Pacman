const canvas = document.querySelector('canvas');

const context = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreEl');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Boundary {
    static width = 40;
    static height = 40;
    constructor({ position, image }){
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw(){
        //context.fillStyle = 'blue';
        //context.fillRect(
        //    this.position.x,
        //    this.position.y,
        //    this.width,
        //    this.height
        //)
        context.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player{
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.radius = 15;
    }

    draw(){
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = 'yellow';
        context.fill();
        context.closePath();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}


class Ghost{
    static speed = 2;
    constructor({position, velocity, color = 'red'}){
        this.position = position
        this.velocity = velocity
        this.radius = 15;
        this.color = color;
        this.prevCollisions = []
        this.speed = 2;
    }

    draw(){
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Pellet{
    constructor({position}){
        this.position = position
        this.radius = 3;
    }

    draw(){
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = 'white';
        context.fill();
        context.closePath();
    }
}

class PowerUp{
    constructor({position}){
        this.position = position
        this.radius = 3;
    }

    draw(){
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = 'white';
        context.fill();
        context.closePath();
    }
}


const pellets = []
const boundaries = []
const ghosts = [
    new Ghost({
        position:{
            x: Boundary.width * 5 + Boundary.width/2,
            y: Boundary.height * 4 + Boundary.height/2
        },
        velocity:{
            x:0,
            y: Ghost.speed
        }
    }),
    new Ghost({
        position:{
            x: Boundary.width * 5 + Boundary.width/2,
            y: Boundary.height * 6 + Boundary.height/2
        },
        velocity:{
            x:0,
            y:-Ghost.speed
        },
        color: 'purple'
    })
]

const player = new Player({
    position: {
        x: Boundary.width + Boundary.width/2,
        y: Boundary.height + Boundary.height/2
    },
    velocity: {
        x: 0,
        y: 0
    }
});

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
}

let lastKey = ''
let score = 0

const map =[
    ['1', '-', '-', '-', '2', ' ', '1', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '4', '-', '3', '.', '.', '.', '|'],
    ['|', '.', '^', '.', '.', '.', '.', '.', '^', '.', '|'],
    ['|', '.', 'V', '.', '^', '.', '^', '.', 'V', '.', '|'],
    ['|', '.', '.', '.', 'V', '.', 'V', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '.', '.', '.', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '^', '.', '^', '.', '.', '.', '|'],
    ['|', '.', '^', '.', 'V', '.', 'V', ' ', '^', '.', '|'],
    ['|', '.', 'V', '.', '.', '.', '.', '.', 'V', '.', '|'],
    ['|', '.', '.', '.', '1', '-', '2', '.', '.', '.', '|'],
    ['4', '-', '-', '-', '3', ' ', '4', '-', '-', '-', '3'],
];


function createImage(src){
    const image = new Image();
    image.src = src;
    return image;
}

function createBoundary(x,y, src){
    return new Boundary({
        position: {
            x: Boundary.width * x,
            y: Boundary.height * y
        },
        image: createImage(src)
    })
}


map.forEach( (row, i) => {
    row.forEach( (symbol, j) => {
        switch(symbol){
            case '-':
                boundaries.push(createBoundary(j,i, 'img/pipeHorizontal.png'));
                break;
            case '|':
                boundaries.push(createBoundary(j,i, 'img/pipeVertical.png'));
                break;
            case '1':
                boundaries.push(createBoundary(j,i, 'img/pipeCorner1.png'));
                break;
            case '2':
                boundaries.push(createBoundary(j,i, 'img/pipeCorner2.png'));
                break;
            case '3':
                boundaries.push(createBoundary(j,i, 'img/pipeCorner3.png'));
                break;
            case '4':
                boundaries.push(createBoundary(j,i, 'img/pipeCorner4.png'));
                break;
            case 'b':
                boundaries.push(createBoundary(j,i, 'img/block.png'));
                break;
            case '[':
                boundaries.push(createBoundary(j,i, 'img/capLeft.png'));
                break;
            case ']':
                boundaries.push(createBoundary(j,i, 'img/capRight.png'));
                break;
            case '^':
                boundaries.push(createBoundary(j,i, 'img/capTop.png'));
                break;
            case 'V':
                boundaries.push(createBoundary(j,i, 'img/capBottom.png'));
                break;
            case '+':
                boundaries.push(createBoundary(j,i, 'img/pipeCross.png'));
                break;
            case '`':
                boundaries.push(createBoundary(j,i, 'img/pipeConnectorBottom.png'));
                break;
            case '~':
                boundaries.push(createBoundary(j,i, 'img/pipeConnectorTop.png'));
                break;
            case '.':
                pellets.push(new Pellet(
                    {position:
                        {
                            x:Boundary.width*j + Boundary.width/2,
                            y:Boundary.height*i + Boundary.height/2
                        }
                    }
                ));
                break;
        }
    });
});

function circleCollidesWithRectangle({circle, rectangle}){
    const padding = Boundary.width/2 - circle.radius - 1;
    return (
    circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    context.clearRect(0, 0, innerWidth, innerHeight)
    
    
    if(keys.w.pressed && lastKey === 'w'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(circleCollidesWithRectangle({
                circle: {...player, velocity: {x: 0, y: -5}},
                rectangle: boundary
            })){
                player.velocity.y = 0;
                break;
            }
            else 
                player.velocity.y = -5;
        }
    } else if(keys.a.pressed && lastKey === 'a'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(circleCollidesWithRectangle({
                circle: {...player, velocity: {x: -5, y: 0}},
                rectangle: boundary
            })){
                player.velocity.x = 0;
                break;
            }
            else 
                player.velocity.x = -5;
        }
    } else if(keys.s.pressed && lastKey === 's'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(circleCollidesWithRectangle({
                circle: {...player, velocity: {x: 0, y: 5}},
                rectangle: boundary
            })){
                player.velocity.y = 0;
                break;
            }
            else 
                player.velocity.y = 5;
        }
    } else if(keys.d.pressed && lastKey === 'd'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i];
            if(circleCollidesWithRectangle({
                circle: {...player, velocity: {x: 5, y: 0}},
                rectangle: boundary
            })){
                player.velocity.x = 0;
                break;
            }
            else 
                player.velocity.x = 5;
        }
    }

        // touching pellets
    for(let i = pellets.length - 1; 0 < i; i--){
        // we are looping from the last to avoid flickering
        const pellet = pellets[i];
        pellet.draw();

        if(Math.hypot(
            pellet.position.x - player.position.x, 
            pellet.position.y - player.position.y)< 
            pellet.radius + player.radius){
            
            pellets.splice(i, 1);
            score+= 10;
            scoreEl.innerHTML = score;
        }
    }
    boundaries.forEach( boundary => {
        boundary.draw();

        // collision detection

        if(circleCollidesWithRectangle({
            circle: player,
            rectangle: boundary
        })){
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
            
        }
    )
    
    player.update();

    ghosts.forEach( ghost => {
        ghost.update();

        if(Math.hypot(
            ghost.position.x - player.position.x, 
            ghost.position.y - player.position.y)< 
            ghost.radius + player.radius){
            cancelAnimationFrame(animationId);
            console.log('you lose')
        }
        const collisions = []
        boundaries.forEach(boundary => {

            // check if colliding right
            if(circleCollidesWithRectangle({
                circle: {...ghost, velocity: {x: ghost.speed, y: 0}},
                rectangle: boundary
            }) && !collisions.includes('right')){
                collisions.push('right');
            }

            // check if colliding left
            if(circleCollidesWithRectangle({
                circle: {...ghost, velocity: {x: -ghost.speed, y: 0}},
                rectangle: boundary
            }) && !collisions.includes('left')){
                collisions.push('left');
            }

            // check if colliding top
            if(circleCollidesWithRectangle({
                circle: {...ghost, velocity: {x: 0, y: -ghost.speed}},
                rectangle: boundary
            }) && !collisions.includes('up')){
                collisions.push('up');
            }

            // check if colliding bottom
            if(circleCollidesWithRectangle({
                circle: {...ghost, velocity: {x: 0, y: ghost.speed}},
                rectangle: boundary
            }) && !collisions.includes('down')){
                collisions.push('down');
            }

            
        });

        if(collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions;
        // we stringify the array since 2 different instance of arrays is always not equal
        if(JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){

            if(ghost.velocity.x > 0) ghost.prevCollisions.push('right');
            else if(ghost.velocity.x < 0) ghost.prevCollisions.push('left');
            else if(ghost.velocity.y > 0) ghost.prevCollisions.push('down');
            else if(ghost.velocity.y < 0) ghost.prevCollisions.push('up');

            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision);
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]
            console.log(collisions)
            switch(direction){
                case 'down':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = ghost.speed;
                    break;
                case 'up':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = -ghost.speed;
                    break;
                case 'right':
                    ghost.velocity.x = ghost.speed;
                    ghost.velocity.y = 0;
                    break;
                case 'left':
                    ghost.velocity.x = -ghost.speed;
                    ghost.velocity.y = 0;
                    break;
            }
            ghost.prevCollisions = []
        }
    })
}

animate();



window.addEventListener('keydown' , ({key}) => {
    switch(key){
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
})

window.addEventListener('keyup' , ({key}) => {
    switch(key){
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
})