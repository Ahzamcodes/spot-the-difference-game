let gameConfig;
let score = 0;
let foundDifferences = new Set();
let markers = new Set();

async function loadGameConfig() {
    try {
        const response = await fetch('game-config.json');
        gameConfig = await response.json();
        initializeGame();
    } catch (error) {
        console.error('Error loading game configuration:', error);
    }
}

function initializeGame() {
    const leftImage = document.getElementById('leftImage');
    const rightImage = document.getElementById('rightImage');
    const scoreDisplay = document.getElementById('score');
    const messageDisplay = document.getElementById('message');
    const tryAgainBtn = document.getElementById('tryAgainBtn');

    leftImage.src = gameConfig.imageLeft;
    rightImage.src = gameConfig.imageRight;

    // Add click event listeners to both images
    leftImage.addEventListener('click', (e) => handleImageClick(e, 'left'));
    rightImage.addEventListener('click', (e) => handleImageClick(e, 'right'));

    // Add click event listener to Try Again button
    tryAgainBtn.addEventListener('click', () => {
        // Reset game state
        score = 0;
        foundDifferences.clear();
        // Clear all highlights
        document.querySelectorAll('.difference-highlight').forEach(el => el.remove());
        // Reset message
        messageDisplay.textContent = '';
        // Reload the game
        loadGameConfig();
    });

    // Initialize score display
    updateScore();
}

function handleImageClick(event, side) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Get the actual image dimensions
    const img = event.target;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Convert click coordinates to match the configuration format
    const xCoord = Math.round((x / rect.width) * naturalWidth);
    const yCoord = Math.round((y / rect.height) * naturalHeight);

    console.log(`Click coordinates: x=${xCoord}, y=${yCoord}`); // Debug log
    checkDifference(xCoord, yCoord, x, y, side);
}

function checkDifference(x, y, clickX, clickY, side) {
    let found = false;
    for (let i = 0; i < gameConfig.differences.length; i++) {
        const diff = gameConfig.differences[i];
        if (foundDifferences.has(i)) continue;

        // Calculate distance from click to difference center
        const distance = Math.sqrt(
            Math.pow(x - diff.x, 2) + 
            Math.pow(y - diff.y, 2)
        );
        
        const tolerance = 20; // Increased tolerance for easier clicking
        
        if (distance <= diff.radius + tolerance) {
            console.log(`Found difference: ${diff.label} at coordinates: x=${x}, y=${y}`); // Debug log
            foundDifferences.add(i);
            score += 1;
            updateScore();
            
            // Show success message
            const messageDisplay = document.getElementById('message');
            messageDisplay.textContent = `Correct! You found ${diff.label}!`;
            messageDisplay.style.color = '#28a745';
            
            // Highlight the found difference with a circle
            highlightDifference(diff, i + 1);
            
            // Check if all differences are found
            if (foundDifferences.size === gameConfig.differences.length) {
                showCompletionMessage();
            }
            
            found = true;
            break;
        }
    }
    
    if (!found) {
        // If no difference was found at the clicked location
        const messageDisplay = document.getElementById('message');
        messageDisplay.textContent = 'Try again!';
        messageDisplay.style.color = '#dc3545';
        
        // Add marker at click position
        addMarker(clickX, clickY, side);
    }
}

function addMarker(x, y, side) {
    const container = document.querySelector(`.image-container:${side === 'left' ? 'first-child' : 'last-child'}`);
    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    container.appendChild(marker);
    
    // Remove marker after 2 seconds
    setTimeout(() => {
        marker.remove();
    }, 2000);
}

function highlightDifference(diff, differenceNumber) {
    // Create or update highlight elements
    const leftHighlight = document.createElement('div');
    const rightHighlight = document.createElement('div');
    
    leftHighlight.className = 'difference-highlight';
    rightHighlight.className = 'difference-highlight';
    
    // Calculate size for the circle based on radius
    const size = diff.radius * 2.5; // Make circle slightly larger
    
    // Position the highlights
    leftHighlight.style.left = `${diff.x - size/2}px`;
    leftHighlight.style.top = `${diff.y - size/2}px`;
    leftHighlight.style.width = `${size}px`;
    leftHighlight.style.height = `${size}px`;
    
    rightHighlight.style.left = `${diff.x - size/2}px`;
    rightHighlight.style.top = `${diff.y - size/2}px`;
    rightHighlight.style.width = `${size}px`;
    rightHighlight.style.height = `${size}px`;
    
    // Add difference label to the highlight
    const numberLabel = document.createElement('div');
    numberLabel.className = 'difference-name';
    numberLabel.textContent = diff.label;
    leftHighlight.appendChild(numberLabel);
    rightHighlight.appendChild(numberLabel.cloneNode(true));
    
    // Add highlights to the images
    document.querySelector('.image-container:first-child').appendChild(leftHighlight);
    document.querySelector('.image-container:last-child').appendChild(rightHighlight);
}

function showCompletionMessage() {
    const messageDisplay = document.getElementById('message');
    messageDisplay.textContent = 'Congratulations! You found all the differences!';
    messageDisplay.style.color = '#28a745';
    messageDisplay.style.fontSize = '1.5em';
    messageDisplay.style.fontWeight = 'bold';
    
    // Show Try Again button with animation
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    tryAgainBtn.style.opacity = '1';
    tryAgainBtn.style.transform = 'scale(1)';
}

function updateScore() {
    const scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = `Score: ${score}/${gameConfig.differences.length}`;
    scoreDisplay.style.fontWeight = 'bold';
}

// Load the game when the page loads
window.addEventListener('load', loadGameConfig); 