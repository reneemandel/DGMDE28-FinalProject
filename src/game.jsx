import { useState, useEffect } from "react"; //here, i am importing tools needed for this component. useState allows the component to "remember" things. 
import { Routes, Route, Link } from "react-router-dom";

// Wrap the Navigation component in a Header component (Week 12, Slide 362)
function Header() {
    return (
        <header className="header">
            <h1 className="brand-title">Run Your Lines</h1>
            <p className="brand-subtitle">Script Practice App</p>
            {/* Navigation Component using Link*/}
            <nav className="navigation">
                <Link to="/settings" className="nav-item"><span>Setup</span></Link>
                <Link to="/" className="nav-item"><span>Practice</span></Link>
                <Link to="/stats" className="nav-item"><span>Stats</span></Link>
            </nav>
        </header>
    );
}

// Component with destructured props - Week 10
function Game({ script, ratings, setRatings }) {
    var [index, setIndex] = useState(0); //number of current line
    var [revealed, setRevealed] = useState(false); //true/false for reveal
    var [currentRating, setCurrentRating] = useState(null); //stores current rating log per line
    var [isFinished, setIsFinished] = useState(false); //tells app when to show the finished screen

    var userLines = script.filter(l => l.isYours); //sub-array of only the lines that belong to the user
    var currentLine = userLines[index];
    var scriptIndex = currentLine ? script.indexOf(currentLine) : -1;
    var cueLine = null;

    if (currentLine && scriptIndex > 0) { // loop starts at the beginning of the script and looks at every line up until the user's current line
        for (var i = 0; i < scriptIndex; i++) { //Every time it finds a line belonging to someone else, it saves it as the cueLine
            if (script[i].character != currentLine.character) {
                cueLine = script[i];
            }
        }
    }

    var masteredCount = ratings.filter(r => r.status == 'Got it').length; //temporary list of all lines where the user said "Got it," then checking the .length of that list to get a total count
    var masteryProgress = userLines.length > 0 ? Math.round((masteredCount / userLines.length) * 100) : 0; //checks if the script actually has lines

    // Arrow function event handler - tells react that the user just clicked a rating so save it
    var rateLine = (status) => {
        setCurrentRating(status);
    };

    var nextLine = () => {
        if (!currentRating || !currentLine) return;

        var newRating = {
            text: currentLine.text,
            status: currentRating
        };

        // Spread operator for state  - new array that contains all the old ratings plus the new one.
        setRatings([...ratings, newRating]);
        setRevealed(false);
        setCurrentRating(null);

        if (index < userLines.length - 1) { //If there are more lines left, move to the next line. 
            setIndex(index + 1);
        } else {
            setIsFinished(true); //if we are at the end, set isFinished to true, which will trigger the "Done" screen.
        }
    };

    // Conditional Rendering 
    if (script.length == 0) { 
        return (
            <div className="main-card text-center">
                <h2 className="card-title">Practice</h2>
                <p className="card-description">No script loaded yet.</p>
                <Link to="/settings" className="no-underline">
                    <button className="btn-primary">Go to Setup</button>
                </Link>
            </div>
        ); // link component keeps the app single page
    }

    if (isFinished) {
        return (
            <div className="main-card text-center">
                <h2 className="card-title">Done!</h2>
                <p className="card-description">Practice session complete!</p>
                <Link to="/stats" className="no-underline">
                    <button className="btn-primary">View Results</button>
                </Link>
            </div>
        ); //stops when finished
    }

    return (
        <div>
            <div className="mastery-card"> 
                <div className="progress-header">
                    <span className="progress-label">Mastered</span>
                    <span className="progress-value">{masteredCount} / {userLines.length}</span>
                </div>
                <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${masteryProgress}%` }}></div>    {/* CSS width to grow and shrink based on the masteryProgress variable. */}
                </div>
            </div> 

            {/* Ternary Rendering*/}
            {cueLine ? (
                <div className="cue-card">
                    <span className="cue-label">Cue from {cueLine.character}</span>
                    <p className="cue-text">"{cueLine.text}"</p>
                </div>
            ) : (
                <div className="no-cue-card">
                    <span className="no-cue-label">You have the First Line...</span>
                    <p className="no-cue-text">Good luck!</p>
                </div>
            )}

            <div className="flashcard"> {/* not revealed or rated, show this HTML */}
                {!revealed && !currentRating && (
                    <div className="text-center">
                        <p className="hidden-label">
                            {currentLine.character}: Line Hidden
                        </p>
                        <button className="btn-primary" onClick={() => setRevealed(true)}>Reveal Line</button>
                    </div>
                )}

                {revealed && !currentRating && (
                    <div className="revealed-view">
                        <p className="revealed-text">
                            "{currentLine.text}"
                        </p>
                        <div className="rating-grid">
                            {/* Passing args to events  */}
                            <button className="rating-btn perfect" onClick={() => rateLine('Got it')}>GOT IT</button>
                            <button className="rating-btn close" onClick={() => rateLine('Close')}>CLOSE</button>
                            <button className="rating-btn missed" onClick={() => rateLine('Missed it')}>MISSED</button>
                        </div>
                    </div>
                )}

                {currentRating && (
                    <div className="text-center">
                        <p className="rating-status-text">
                            Rated: {currentRating}
                        </p>
                        <button className="btn-primary" onClick={nextLine}>Next Line</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function Settings({ onSave }) {
    var [text, setText] = useState(""); //initialize the strings with "" and the boolean with false.
    var [char, setChar] = useState("");
    var [saved, setSaved] = useState(false);

    var handlePractice = (e) => {
        // preventDefault 
        e.preventDefault();
        if (!text || !char) return;

        var lines = text.split('\n');
        var linesArray = [];
        var currentLineObj = null;

        lines.forEach(rawLine => {
            var line = rawLine.trim();
            if (!line) return;

            if (line.includes(':')) {
                var parts = line.split(':');
                var character = parts[0]?.trim();
                var textContent = parts.slice(1).join(':').trim();

                currentLineObj = {
                    character,
                    text: textContent,
                    isYours: character.toLowerCase() == char.toLowerCase() //case sensitive fix
                };
                linesArray.push(currentLineObj);
            } else if (currentLineObj) {
                currentLineObj.text += " " + line;
            }
        });

        if (linesArray.length > 0) {
            onSave(linesArray);
            setSaved(true);
        } else {
            alert("Format error: Use Name: Line");
        }
    };

    return (
        <div className="main-card">
            <h2 className="card-title">Setup</h2>

            <div className="instruction-box">
                <p className="instruction-title">Instructions</p>
                <ul className="instruction-list">
                    <li>Enter your character name exactly.</li>
                    <li>Paste your script using the Name: Line format.</li>
                    <li>Click Practice to begin.</li>
                </ul>
            </div>

            <form onSubmit={handlePractice}>
                <div className="form-group">
                    <label className="form-label">My Character Name</label>
                    {/* Controlled inputs - link the value to a state variable and use onChange to update that state every time the user types a letter.*/}
                    <input className="input" type="text" value={char} onChange={(e) => setChar(e.target.value)} /> 
                </div>
                <div className="form-group">
                    <label className="form-label">Paste Script</label>
                    <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
                </div>
                <button className="btn-primary" type="submit" style={{ width: '100%' }}>Practice</button>
            </form>

            {saved && (
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Go Practice</button>
                </Link>
            )}
        </div>
    );
}

//Perfect, Almost, and Missed buckets and logic on when to show them to review 
function PlayerStats({ ratings, onRunAgain, onPracticeWeak }) {
    var [missedOpen, setMissedOpen] = useState(false);
    var [closeOpen, setCloseOpen] = useState(false);

    var nailedLines = ratings.filter(r => r.status == 'Got it');
    var closeLines = ratings.filter(r => r.status == 'Close');
    var missedLines = ratings.filter(r => r.status == 'Missed it');
    var weakLines = ratings.filter(r => r.status != 'Got it');

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-value">{nailedLines.length}</div><div className="stat-label">Perfect</div></div>
                <div className="stat-card"><div className="stat-value">{closeLines.length}</div><div className="stat-label">Almost</div></div>
                <div className="stat-card"><div className="stat-value">{missedLines.length}</div><div className="stat-label">Missed</div></div>
            </div>

            {missedLines.length > 0 && (
                <div className="list-wrapper">
                    <div className="list-header review" onClick={() => setMissedOpen(!missedOpen)}>
                        <p>Review Missed Lines: {missedLines.length}</p>
                        <span>{missedOpen ? 'Hide' : 'Show'}</span>
                    </div>
                    {/* Using index 'i' as key */}
                    {missedOpen && missedLines.map((l, i) => (
                        <div className="list-item" key={i}><p>{l.text}</p></div>
                    ))}
                </div>
            )}

            {closeLines.length > 0 && (
                <div className="list-wrapper">
                    <div className="list-header" onClick={() => setCloseOpen(!closeOpen)}>
                        <p>Review Almost Lines: {closeLines.length}</p>
                        <span>{closeOpen ? 'Hide' : 'Show'}</span>
                    </div>
                    {/* Using index 'i' as key */}
                    {closeOpen && closeLines.map((l, i) => (
                        <div className="list-item" key={i}><p>{l.text}</p></div>
                    ))}
                </div>
            )}

            <div className="summary-card">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    {/* (onClick= ) When the button is clicked, it triggers the logic back up in the main app to reset the script.  */}
                    <button className="btn-navy" style={{ width: '100%', marginBottom: '10px' }} onClick={onRunAgain}>Full Run Again</button> 
                </Link>
                {weakLines.length > 0 && (
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ width: '100%' }} onClick={onPracticeWeak}>Study Weak Lines</button>
                    </Link>
                )}
            </div>
        </div>
    );
}

// Logic Component - handles the state data
export default function MyApp() {
    var [script, setScript] = useState([]);
    var [ratings, setRatings] = useState([]);
    var [fullScript, setFullScript] = useState([]);

    useEffect(() => {
        var savedScript = localStorage.getItem("runLines_script");
        if (savedScript) {
            var parsed = JSON.parse(savedScript);
            setFullScript(parsed);
            setScript(parsed);
        }
    }, []);

    var saveScript = (data) => {
        setFullScript(data);
        setScript(data);
        setRatings([]);
        localStorage.setItem("runLines_script", JSON.stringify(data));
    };

    var handleRunAgain = () => {
        setScript(fullScript);
        setRatings([]);
    };

    var handlePracticeWeak = () => {
        var weakLinesText = ratings.filter(r => r.status != 'Got it').map(r => r.text);
        var weakOnlyScript = fullScript.filter(l => {
            if (!l.isYours) return true;
            return weakLinesText.includes(l.text);
        });
        setScript(weakOnlyScript);
        setRatings([]);
    };

    return (
        <div className="app-wrapper">
            <div className="container">
                <Header />
                {/* Routes Component */}
                <Routes>
                    <Route path="/" element={<Game script={script} ratings={ratings} setRatings={setRatings} />} />
                    <Route path="/settings" element={<Settings onSave={saveScript} />} />
                    <Route path="/stats" element={<PlayerStats ratings={ratings} onRunAgain={handleRunAgain} onPracticeWeak={handlePracticeWeak} />} />
                    <Route path="*" element={<h2>404 Page Not Found</h2>} />
                </Routes>
            </div>
        </div>
    );
}