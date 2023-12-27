document.addEventListener('DOMContentLoaded', () => {
    history.pushState(null, document.title, location.href);
    window.addEventListener('popstate', () => {
        history.pushState(null, document.title, location.href);
    });
    let myShip, boxes, timerInterval;
    const storedUsername = localStorage.getItem("username");
    const score = localStorage.getItem(`${storedUsername}_finalScore`);
    const welcomeMessage = storedUsername
    ? (score ? `Welcome back ${storedUsername}! Your last score was: ${score}` : `Welcome ${storedUsername}!`)
    : "Welcome!";
    const welcomePopup = new Popup({
        id: "welcome_popup",
        title: welcomeMessage,
        content: `{btn-popup-button}[Start Game]`,
        hideCloseButton: true,
        disableScroll: true,
        allowClose: false,
        showImmediately: true,
        loadCallback: () => {
            const button = document.querySelector(".popup-button");
            button.addEventListener('click', () => {
                welcomePopup.hide();
                startGame();
            });
        }
    });

    function startGame() {
        if (myShip) {
            myShip.remove();
        }
        myShip = new Ship();
        Boxes.clearBoxes();
        boxes = Boxes.createBoxes(8, 6);
        startTimerAndBoxMovement(2);
    }
    
    function startTimerAndBoxMovement(minutes) {
        let second = minutes * 60;
        const updatedTimer = () => {
            const LeftMinutes = Math.floor(second / 60);
            const LeftSeconds = second % 60;
            const timer = `${LeftMinutes.toString().padStart(2, '0')}:${LeftSeconds.toString().padStart(2, '0')} minute`;
            document.querySelector('#countdownTimer').innerHTML = timer;
    
            if (second <= 0 || myShip.checkCollision()) {
                endGame();
            }
            second--;
        };
    
        timerInterval = setInterval(updatedTimer, 1000);
    
    
        function endGame() {
            clearInterval(timerInterval);
            document.querySelector('#countdownTimer').innerHTML = 'Time out!';
            
            const endGamePopup = new Popup({
                id: "end_game_popup",
                title:`Game Over ${storedUsername}Your Score is ${score}`,
                content: `{btn-popup-button-exit}[Exit] ,{btn-popup-regist}[Home]`,
                hideCloseButton: true,
                disableScroll: true,
                allowClose: false,
                showImmediately: true,
                loadCallback: () => {
                    const button = document.querySelector(".popup-button-exit");
                    button.addEventListener('click', () => {
                            window.close();
                    });
                    document.querySelector(".popup-regist").onclick =
                    () => {
                     
                       
                    };
                }

            });
           
        }
    }


    welcomePopup.show();
});



class Object { 
    constructor({tag = 'div' , className=''} = {}) {
        this.element = document.createElement(tag);
        document.body.appendChild(this.element);
        this.element.className = 'object' + " " +className;

    }
    setX(x) {
        this.element.style.left = `${x}px`;
    }

    setY(y) {
        this.element.style.top = `${y}px`;
    }
    getX() {
        return this.element.getBoundingClientRect().left;
    }
    getY() {
        return this.element.getBoundingClientRect().top;
    }

}

class Ship extends Object {
    constructor() {
        super({ tag:'img', className: 'ship'});
        this.element.src = './img/ship.png';
        this.setX(window.innerWidth / 2);
        this.setY(window.innerHeight - 110);
        this.bullets = [];
        this.moveBullets();
        this.setup(); 
    }
    setup() {
        document.addEventListener('keydown', (event) => this.handleKeyEvent(event, true));
        document.addEventListener('keyup', (event) => this.handleKeyEvent(event, false));  
    }

    handleKeyEvent(event, KeyDown) {
        switch (event.key) {
            case 'ArrowLeft':
                this.move('left');
                break;
            case 'ArrowRight':
                this.move('right');
                break;
            case ' ':
                this.isFiring = KeyDown;
                if (KeyDown) {
                    this.fireBullets();
                }
                break;
        }
    } 
    move(direction) {
        if (direction === 'left' && this.getX() > 0) {
            this.setX(this.getX() - 20);
        } else if (direction === 'right' && this.getX() < window.innerWidth - 130) {
            this.setX(this.getX() + 20);
        }
        
    } 
    moveBullets() {
        this.bullets = this.bullets.filter((bullet) => {
            bullet.move();
    
            if (this.checkCollision()) {
                this.isFiring = false; 
                Boxes.gameOver = true;
            }
    
            return bullet.getY() + this.element.offsetHeight > 0;
        });
    
        requestAnimationFrame(() => this.moveBullets());
    }
    fireBullets() {
        if (!Boxes.gameOver) {
            const currentBullet = new Date().getTime();
            const lastBullet = currentBullet - (this.lastBullet || 0);
    
            if (this.isFiring && lastBullet > 150) {
                this.bullets.push(
                    new Bullet({
                        x: this.getX() + this.element.clientWidth / 2,
                        y: this.getY() - this.element.clientHeight / 2,
                    })
                );
                this.lastBullet = currentBullet;
            }
    
            if (this.isFiring) {
                requestAnimationFrame(() => this.fireBullets());
            }
        }
    }
        
    checkCollision() {
        const shipRect = this.element.getBoundingClientRect();
       
        for (const box of Boxes.Boxes) {
          const boxRect = box.element.getBoundingClientRect();
      
          if (
            shipRect.top < boxRect.bottom &&
            shipRect.bottom > boxRect.top &&
            shipRect.left < boxRect.right &&
            shipRect.right > boxRect.left
          ) {
            Boxes.gameOver = true;
            return true;
          }
        }
      
        return false;
     }
}

class Bullet extends Object {
    constructor({ x, y }) {
        super({ className: 'bullet' });
        this.setX(x);
        this.setY(y);
        this.speed = 3;
    }
    
    move() {
        this.setY(this.getY() - this.speed);
    
        for (const box of Boxes.Boxes) {
          if (this.checkCollision(box)) {
           
            box.remove(); 
            break; 
          }
        }
      }
    checkCollision(box) {
        const bulletRect = this.element.getBoundingClientRect();
        const boxRect = box.element.getBoundingClientRect();
    
        if (
            bulletRect.top < boxRect.bottom &&
            bulletRect.bottom > boxRect.top &&
            bulletRect.left < boxRect.right &&
            bulletRect.right > boxRect.left
        ) {
            box.remove(); 
            this.element.remove();
            Boxes.incrementScore(box.score); 
            return true;
        }
    
        return false;
    }
   
  
}

class Boxes extends Object {
    static Boxes = [];
    static gameOver = false;
    constructor({ x, y, RedBox }) {
        super({ className: RedBox ? 'redBox' : 'boxes' });
      this.setX(x);
      this.setY(y);
      this.score = RedBox ? 15 : 2;
      this.RedBox = RedBox;
      this.speed = parseInt(localStorage.getItem('speedLevel'));        
      this.position = 'bottom';
     
    }
  
    static createBoxes(rows, cols) {
        this.clearBoxes(); 
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const RedBox = Math.random() < 0.2; 
                const box = new Boxes({ x: i * 60 + window.innerWidth / 4, y: j * 70 + 70, RedBox });
                this.Boxes.push(box);
            }
        }

        this.moveAllBoxes();
        return this.Boxes;
    }
    static clearBoxes() {
        this.Boxes.forEach(box => box.remove());
        this.Boxes = [];
    }
    movedown() {
      if (!Boxes.gameOver && this.position === 'bottom') {
        this.setY(this.getY() + this.speed);
      }
    }
  
    static moveAllBoxes() {
        function animate() {
            Boxes.Boxes.forEach((box) => box.movedown());
            requestAnimationFrame(animate);
        }
        animate();
    }
    remove() {
        this.element.remove();
      }
      static incrementScore(finalScore) {
        let scoreElement = document.getElementById('score');
        let scoreText = scoreElement.innerText;
        let score = parseInt(scoreText.substring(7)) || 0;
        score+=finalScore;
        scoreElement.innerText = 'Score: ' + score;
        let storedUsername = localStorage.getItem("username");
        localStorage.setItem(`${storedUsername}_finalScore`, score);
    }
}

  
