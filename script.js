document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.wrapper');
    const chocolatePieces = document.querySelector('.chocolate-pieces');
    
    // Create 2D array to track pieces
    const ROWS = 3;
    const COLS = 5;  // Changed from 8 to 5
    let chocolateGrid = Array(ROWS).fill().map(() => Array(COLS).fill(false)); // false means not eaten
    
    let isDragging = false;
    let startX;
    const DAILY_LIMIT = 2; // 2 full chocolate bars
    const TOTAL_PIECES = 15; // Total pieces in one chocolate bar

    // Initialize the chocolate tracking system
    function initDailyLimit() {
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem('chocolateDate');
        
        // Reset counts if it's a new day
        if (storedDate !== today) {
            localStorage.setItem('chocolateDate', today);
            localStorage.setItem('piecesEaten', '0');
            localStorage.setItem('barsEaten', '0');
        }

        // Check if limit already reached
        const barsEaten = parseInt(localStorage.getItem('barsEaten') || '0');
        if (barsEaten >= DAILY_LIMIT) {
            disableChocolatePieces();
            if (wrapper.classList.contains('unwrapped')) {
                showDailyLimitMessage();
            }
        }
    }

    function updateChocolateCount() {
        const piecesEaten = parseInt(localStorage.getItem('piecesEaten') || '0');
        const barsEaten = parseInt(localStorage.getItem('barsEaten') || '0');
        
        if (barsEaten >= DAILY_LIMIT) return false;
        
        const newPiecesEaten = piecesEaten + 1;
        localStorage.setItem('piecesEaten', newPiecesEaten.toString());
        
        // Check if a full bar is eaten
        if (newPiecesEaten % TOTAL_PIECES === 0) {
            const newBarsEaten = barsEaten + 1;
            localStorage.setItem('barsEaten', newBarsEaten.toString());
            
            console.log('Chocolate bars eaten:', newBarsEaten); // Debug log
            
            if (newBarsEaten >= DAILY_LIMIT) {
                setTimeout(() => {
                    showDailyLimitMessage();
                    disableChocolatePieces();
                }, 500);
            } else {
                showBarCompletedMessage(newBarsEaten);
            }
        }
        return true;
    }

    function showBarCompletedMessage(barsEaten) {
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        
        const content = document.createElement('div');
        content.className = 'celebration-content';
        content.innerHTML = `
            <h2>Yummy! One chocolate bar done! 🍫</h2>
            <p>You've eaten ${barsEaten} out of ${DAILY_LIMIT} chocolate bars for today.</p>
            <button class="restart-btn" onclick="location.reload()">Get Next Bar</button>
        `;
        
        overlay.appendChild(content);
        document.querySelector('.chocolate-wrapper').appendChild(overlay);
    }

    function showDailyLimitMessage() {
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        
        const content = document.createElement('div');
        content.className = 'celebration-content';
        content.innerHTML = `
            <h2>That's enough chocolate for today! 🍫</h2>
            <p>You've had your ${DAILY_LIMIT} chocolate bars for today. Come back tomorrow for more!</p>
            <button class="restart-btn" onclick="location.reload()">Close</button>
        `;
        
        overlay.appendChild(content);
        document.querySelector('.chocolate-wrapper').appendChild(overlay);
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

    // Enhanced touch handling
    let touchStartX = 0;
    let minSwipeDistance = window.innerWidth < 768 ? 30 : 100; // Reduced threshold for mobile

    // Touch event handlers
    wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        wrapper.style.transition = 'none'; // Remove transition during drag
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling while dragging
        
        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX;
        
        // Add visual feedback during drag
        if (diffX > 0) {
            wrapper.style.transform = `translateX(${diffX * 0.5}px) rotateY(-${diffX * 0.2}deg)`;
        }
        
        // Check if swipe distance is enough
        if (diffX > minSwipeDistance && !wrapper.classList.contains('unwrapped')) {
            unwrapChocolate();
        }
    }, { passive: false });

    wrapper.addEventListener('touchend', () => {
        // Reset transform if not unwrapped
        if (!wrapper.classList.contains('unwrapped')) {
            wrapper.style.transition = 'transform 0.3s ease';
            wrapper.style.transform = '';
        }
    });

    // Function to handle unwrapping
    function unwrapChocolate() {
        wrapper.classList.add('unwrapped');
        playUnwrapSound();
        wrapper.style.transition = 'all 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)';
        wrapper.style.transform = 'translateX(120%) rotateY(-120deg)';
        wrapper.style.opacity = '0';
        wrapper.style.pointerEvents = 'none';
    }

    // Keep existing mouse/drag event handlers but adjust threshold
    wrapper.addEventListener('dragstart', (e) => {
        isDragging = true;
        startX = e.clientX;
        
        const img = new Image();
        e.dataTransfer.setDragImage(img, 0, 0);
    });

    wrapper.addEventListener('drag', (e) => {
        if (!isDragging || !e.clientX) return;
        
        const diff = e.clientX - startX;
        if (Math.abs(diff) > minSwipeDistance) {
            wrapper.classList.add('unwrapped');
            playUnwrapSound();
            wrapper.style.pointerEvents = 'none';
        }
    });

    // Add visual feedback styles
    const styles = document.createElement('style');
    styles.textContent = `
        .wrapper {
            touch-action: none;
            will-change: transform;
        }
        
        @media (max-width: 768px) {
            .wrapper {
                cursor: grab;
                transition: transform 0.3s ease;
            }
            
            .wrapper:active {
                cursor: grabbing;
            }
        }
    `;
    document.head.appendChild(styles);

    // Sound effects
    function playUnwrapSound() {
        const audio = new Audio('unwrap-sound.mp3');
        audio.play().catch(err => console.log('Sound play failed:', err));
    }

    function playEatingSound() {
        const audio = new Audio('eating-sound.mp3');
        audio.play().catch(err => console.log('Sound play failed:', err));
    }

    function createPiece(row, col) {
        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.dataset.row = row;
        piece.dataset.col = col;
        
        piece.addEventListener('click', function() {
            if (!wrapper.classList.contains('unwrapped')) {
                piece.classList.add('shake');
                setTimeout(() => piece.classList.remove('shake'), 500);
                return;
            }

            const barsEaten = parseInt(localStorage.getItem('barsEaten') || '0');
            if (barsEaten >= DAILY_LIMIT) {
                showDailyLimitMessage();
                return;
            }

            if (!isEatable(row, col)) {
                piece.classList.add('shake');
                setTimeout(() => piece.classList.remove('shake'), 500);
                return;
            }

            if (updateChocolateCount()) {
                this.classList.add('eaten');
                chocolateGrid[row][col] = true;
                playEatingSound();
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
        
        return piece;
    }

    // Create chocolate pieces
    for(let row = 0; row < ROWS; row++) {
        for(let col = 0; col < COLS; col++) {
            const piece = createPiece(row, col);
            chocolatePieces.appendChild(piece);
        }
    }

    // Initialize the daily limit system
    initDailyLimit();
}); 