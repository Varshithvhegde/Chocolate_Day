document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.wrapper');
    const chocolatePieces = document.querySelector('.chocolate-pieces');
    
    // Create 2D array to track pieces
    const ROWS = 3;
    const COLS = 5;  // Changed from 8 to 5
    let chocolateGrid = Array(ROWS).fill().map(() => Array(COLS).fill(false)); // false means not eaten
    
    let piecesEaten = 0;
    const totalPieces = ROWS * COLS;

    // Create chocolate pieces (3x5 = 15 pieces)
    for(let row = 0; row < ROWS; row++) {
        for(let col = 0; col < COLS; col++) {
            const piece = document.createElement('div');
            piece.className = 'piece';
            piece.dataset.row = row;
            piece.dataset.col = col;
            
            piece.addEventListener('click', function() {
                if (!isEatable(row, col)) {
                    // Add shake animation if piece can't be eaten
                    piece.classList.add('shake');
                    setTimeout(() => piece.classList.remove('shake'), 500);
                    return;
                }
                
                console.log('Piece eaten!');
                this.classList.add('eaten');
                this.style.transform = 'scale(0)';
                chocolateGrid[row][col] = true; // Mark as eaten
                piecesEaten++;
                playEatingSound();

                // Check if all pieces are eaten
                if (piecesEaten === totalPieces) {
                    setTimeout(showCelebration, 500);
                }
            });
            
            // Add hover effect only for eatable pieces
            piece.addEventListener('mouseover', function() {
                if (isEatable(row, col)) {
                    this.classList.add('eatable');
                }
            });
            
            piece.addEventListener('mouseout', function() {
                this.classList.remove('eatable');
            });
            
            chocolatePieces.appendChild(piece);
        }
    }

    // Function to check if a piece can be eaten
    function isEatable(row, col) {
        // Can't eat if wrapper is not unwrapped
        if (!wrapper.classList.contains('unwrapped')) return false;
        
        // Already eaten pieces can't be eaten again
        if (chocolateGrid[row][col]) return false;
        
        // Edge pieces are always eatable
        if (row === 0 || row === ROWS-1 || col === 0 || col === COLS-1) return true;
        
        // Check adjacent pieces (up, down, left, right)
        // If any adjacent piece is eaten, this piece becomes eatable
        return chocolateGrid[row-1][col] || // up
               chocolateGrid[row+1][col] || // down
               chocolateGrid[row][col-1] || // left
               chocolateGrid[row][col+1];   // right
    }

    // Unwrapping animation
    let isDragging = false;
    let startX;
    let startY;
    let initialTouchX;
    let hasMoved = false;

    // Add touch event handlers
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrapper.addEventListener('touchend', handleTouchEnd);

    function handleTouchStart(e) {
        isDragging = true;
        initialTouchX = e.touches[0].clientX;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        hasMoved = false;
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const diffX = touchX - startX;
        const diffY = touchY - startY;

        // Determine if the movement is more horizontal than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            e.preventDefault(); // Prevent scrolling only for horizontal moves
            hasMoved = true;
            
            const diff = touchX - initialTouchX;
            
            // Make unwrapping easier on mobile
            if (Math.abs(diff) > 50) { // Reduced threshold for mobile
                wrapper.classList.add('unwrapped');
                playUnwrapSound();
                wrapper.style.pointerEvents = 'none';
            }
        }
    }

    function handleTouchEnd() {
        isDragging = false;
        if (!hasMoved) {
            // Handle tap if there was no significant movement
            wrapper.click();
        }
    }

    // Keep existing mouse/drag event handlers
    wrapper.addEventListener('dragstart', (e) => {
        isDragging = true;
        startX = e.clientX;
        
        const img = new Image();
        e.dataTransfer.setDragImage(img, 0, 0);
    });

    wrapper.addEventListener('drag', (e) => {
        if (!isDragging || !e.clientX) return;
        
        const diff = e.clientX - startX;
        if (Math.abs(diff) > 100) {
            wrapper.classList.add('unwrapped');
            playUnwrapSound();
            wrapper.style.pointerEvents = 'none';
        }
    });

    wrapper.addEventListener('dragend', () => {
        isDragging = false;
    });

    // Sound effects
    function playUnwrapSound() {
        const audio = new Audio('unwrap-sound.mp3');
        audio.play().catch(err => console.log('Sound play failed:', err));
    }

    function playEatingSound() {
        const audio = new Audio('eating-sound.mp3');
        audio.play().catch(err => console.log('Sound play failed:', err));
    }

    function showCelebration() {
        // Create celebration overlay
        const chocolateBar = document.querySelector('.chocolate');  // Target the chocolate div instead
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        
        const content = document.createElement('div');
        content.className = 'celebration-content';
        content.innerHTML = `
            <h2>Yummy! 😋</h2>
            <p>You've enjoyed every bit of chocolate!</p>
            <button class="restart-btn">Have Another Chocolate? 🍫</button>
        `;
        
        celebration.appendChild(content);
        chocolateBar.appendChild(celebration); // Append to chocolate div

        // Start confetti
        startConfetti();

        // Add restart functionality
        const restartBtn = celebration.querySelector('.restart-btn');
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    function startConfetti() {
        for (let i = 0; i < 100; i++) {
            createConfetti();
        }
    }

    function createConfetti() {
        const chocolateBar = document.querySelector('.chocolate');
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Position confetti within chocolate bar
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';  // Random starting position within chocolate
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.opacity = Math.random();
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        const colors = ['#FFD700', '#6b35a4', '#4a1e1e', '#FF69B4', '#632626'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        chocolateBar.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}); 