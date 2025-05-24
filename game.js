const { useState, useEffect, useRef } = React;

function SpotTheDifferenceGame() {
    const [gameData, setGameData] = useState(null);
    const [foundDifferences, setFoundDifferences] = useState([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [levels] = useState([
        {
            id: 1,
            title: "Level 1 - Animals",
            images: {
                image1: "imageLeft.jpg",
                image2: "imageRight.jpg"
            },
            differences: [
                { x: 78, y: 264, width: 20, height: 20 },  // Difference 1
                { x: 74, y: 464, width: 20, height: 20 },  // Difference 2
                { x: 244, y: 150, width: 20, height: 20 }, // Difference 3
                { x: 226, y: 387, width: 20, height: 20 }, // Difference 4
                { x: 421, y: 456, width: 20, height: 20 }, // Difference 5
                { x: 416, y: 77, width: 20, height: 20 },  // Difference 6
                { x: 520, y: 67, width: 20, height: 20 },  // Difference 7
                { x: 530, y: 452, width: 20, height: 20 }  // Difference 8
            ]
        },
        {
            id: 2,
            title: "Level 2 - Nature",
            images: {
                image1: "natureleft.jpg",
                image2: "natureright.jpg"
            },
            differences: [
                { x: 150, y: 250, width: 60, height: 60 },
                { x: 400, y: 200, width: 50, height: 50 },
                { x: 600, y: 350, width: 40, height: 40 }
            ]
        }
    ]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const startTimeRef = useRef(null);
    const canvasRefs = [useRef(null), useRef(null)];
    const [error, setError] = useState(null);

    // Load level data and reset state
    useEffect(() => {
        try {
            const level = levels.find(l => l.id === currentLevel);
            if (level) {
                setGameData(level);
                setFoundDifferences([]);
                setScore(0);
                setTimer(0);
                setImagesLoaded(false);
                startTimeRef.current = Date.now();
                setError(null);
            } else {
                setError('Level not found');
            }
        } catch (e) {
            setError('Error loading level: ' + e.message);
        }
    }, [currentLevel, levels]);

    // Timer effect
    useEffect(() => {
        if (!imagesLoaded) return;
        setTimer(0);
        startTimeRef.current = Date.now();
        const interval = setInterval(() => {
            setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [imagesLoaded, gameData]);

    // Draw found differences on canvas
    useEffect(() => {
        if (!imagesLoaded || !gameData) return;
        foundDifferences.forEach(idx => drawDifference(idx));
    }, [foundDifferences, imagesLoaded, gameData]);

    // Helper to get click position relative to canvas
    const getClickPosition = (e, num) => {
        const canvas = canvasRefs[num - 1].current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        return { x, y };
    };

    // Handle canvas click
    const handleCanvasClick = (e, num) => {
        console.log('Canvas clicked', num, e.clientX, e.clientY);
        if (!gameData) return;
        const canvas = canvasRefs[num - 1].current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const found = gameData.differences.findIndex((diff, i) => {
            return (
                x >= diff.x && x <= diff.x + diff.width &&
                y >= diff.y && y <= diff.y + diff.height
            );
        });
        if (found !== -1) {
            setScore(prev => prev + 1); // Increment score on every valid click
            if (!foundDifferences.includes(found)) {
                setFoundDifferences([...foundDifferences, found]);
                playSound('click-sound');
                drawDifference(found);
                if (foundDifferences.length + 1 === gameData.differences.length) {
                    endGame();
                }
            }
        } else {
            // Draw a pencil-like marker at the click position
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.strokeStyle = '#ff0000'; // bright red for visibility
            ctx.lineWidth = 8;
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();
        }
    };

    // Draw a difference marker
    const drawDifference = (index) => {
        if (!gameData) return;
        const diff = gameData.differences[index];
        [0, 1].forEach(num => {
            const canvas = canvasRefs[num].current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.strokeStyle = '#ff0000'; // bright red for visibility
            ctx.lineWidth = 8;
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.ellipse(
                diff.x + diff.width / 2,
                diff.y + diff.height / 2,
                diff.width / 2 + 10,
                diff.height / 2 + 10,
                0, 0, 2 * Math.PI
            );
            ctx.stroke();
            ctx.restore();
        });
    };

    // Clear canvases when images are loaded or level changes
    const handleImagesLoaded = () => {
        [0, 1].forEach(num => {
            const canvas = canvasRefs[num].current;
            if (canvas && gameData) {
                const img = document.getElementById('image' + (num + 1));
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.width = img.width + 'px';
                canvas.style.height = img.height + 'px';
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            }
        });
        setImagesLoaded(true);
    };

    const endGame = () => {
        playSound('success-sound');
    };

    const playSound = (id) => {
        const audio = document.getElementById(id);
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    };

    const nextLevel = () => {
        if (currentLevel < levels.length) {
            setCurrentLevel(currentLevel + 1);
        }
    };

    // Fallback UI for loading and error states
    if (error) {
        return <div style={{color: 'red'}}>Error: {error}</div>;
    }
    if (!gameData) {
        return <div>Loading game data...</div>;
    }

    return (
        <div className="container">
            <h1 id="game-title">{gameData ? gameData.title : 'Loading...'}</h1>
            <div className="game-info">
                <span id="score">Score: {score}</span>
                <span id="timer">Time: {timer}s</span>
            </div>
            <div className="images-wrapper">
                <div className="image-container" id="image1-container">
                    <img
                        id="image1"
                        src={gameData ? gameData.images.image1 : ''}
                        alt="Image 1"
                        onLoad={handleImagesLoaded}
                        style={{ display: 'block' }}
                    />
                    <canvas
                        ref={canvasRefs[0]}
                        id="canvas1"
                        onClick={e => handleCanvasClick(e, 1)}
                    ></canvas>
                </div>
                <div className="image-container" id="image2-container">
                    <img
                        id="image2"
                        src={gameData ? gameData.images.image2 : ''}
                        alt="Image 2"
                        onLoad={handleImagesLoaded}
                        style={{ display: 'block' }}
                    />
                    <canvas
                        ref={canvasRefs[1]}
                        id="canvas2"
                        onClick={e => handleCanvasClick(e, 2)}
                    ></canvas>
                </div>
            </div>
            <div id="message">
                {gameData && foundDifferences.length === (gameData.differences.length || 0)
                    ? 'Congratulations! You found all the differences!'
                    : ''}
            </div>
            <button onClick={nextLevel}>Next Level</button>
        </div>
    );
}

ReactDOM.render(<SpotTheDifferenceGame />, document.getElementById('root')); 