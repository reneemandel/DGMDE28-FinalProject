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
            {/* Mastery Progress Section: Displays how many lines the user has memorized */}
            <div className="mastery-card">
                <div className="progress-header">
                    <span className="progress-label">Mastered</span>
                    {/* Displays the 'Got it' count vs the total lines for this character */}
                    <span className="progress-value">{masteredCount} / {userLines.length}</span>
                </div>
                {/* Visual Progress Bar container */}
                <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${masteryProgress}%` }}></div>    {/* CSS width to grow and shrink based on the masteryProgress variable. */}
                </div>
            </div>

            {/* Ternary Rendering: 
            This checks if 'cueLine' has a value.
            If TRUE (cueLine exists): Renders the cue line UI showing who spoke last.
            If FALSE (cueLine is null): Renders the 'First Line' UI. */}
            {cueLine ? (
                <div className="cue-card">
                    <span className="cue-label">Cue from {cueLine.character}</span>
                    <p className="cue-text">"{cueLine.text}"</p>
                </div>
            ) : (

                /* The 'False' result */
                <div className="no-cue-card">
                    <span className="no-cue-label">You have the First Line...</span>
                    <p className="no-cue-text">Good luck!</p>
                </div>
            )}

            <div className="flashcard"> {/*  This block only displays if the line is NOT yet revealed AND a rating hasn't been selected. */}
                {!revealed && !currentRating && (
                    <div className="text-center">
                        {/* JSX Expressions: Injecting dynamic data from state into the UI */}
                        <p className="hidden-label">
                            {currentLine.character}: Line Hidden
                        </p>
                        {/* Event Handling: Using an anonymous arrow function to update state on click */}
                        <button className="btn-primary" onClick={() => setRevealed(true)}>Reveal Line</button>
                    </div>
                )}

                {/* This displays the revealed line and the rating options once 'revealed' is true */}
                {revealed && !currentRating && (
                    <div className="revealed-view">
                        <p className="revealed-text">
                            "{currentLine.text}"
                        </p>
                        <div className="rating-grid">
                            {/* Passing Arguments to Event Handlers: We use an arrow function pattern () => function(arg) to pass specific rating strings back to the handler function. */}
                            <button className="rating-btn perfect" onClick={() => rateLine('Got it')}>GOT IT</button>
                            <button className="rating-btn close" onClick={() => rateLine('Close')}>CLOSE</button>
                            <button className="rating-btn missed" onClick={() => rateLine('Missed it')}>MISSED</button>
                        </div>
                    </div>
                )}

                {/* If currentRating is not null, the second part of the && expression executes. This shows the confirmation of the rating and the button to proceed. */}
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

{/* Destructured Props (Week 10): Extracting 'onSave' directly from the props object. */ }
function Settings({ onSave }) {
    var [text, setText] = useState(""); //initialize the strings with "" and the boolean with false.
    var [char, setChar] = useState("");
    var [saved, setSaved] = useState(false);

    var handlePractice = (e) => {
        // This stops the browser from refreshing the whole page when the button is clicked.
        e.preventDefault();
        // If the user didn't type a name or paste a script, stop here and do nothing.
        if (!text || !char) return;

        // Take the big block of text and turn it into a list (array) of individual lines.
        var lines = text.split('\n');
        var linesArray = [];
        var currentLineObj = null;

        // Now, look at every line in that list one by one.
        lines.forEach(rawLine => {
            // Clean up any extra spaces at the start or end of the line.
            var line = rawLine.trim();
            if (!line) return; // If the line is totally empty, just skip it.

            // If the line has a colon, we know a new character is starting to talk.
            if (line.includes(':')) {
                // Split the line at the colon to separate the name from the dialogue.
                var parts = line.split(':');
                var character = parts[0]?.trim();
                var textContent = parts.slice(1).join(':').trim();

                // Create a new "object" for this line with the name and the text.
                currentLineObj = {
                    character,
                    text: textContent,
                    // Check if this line belongs to the user. We use lowercase so it matches even if they didn't get the capitalization perfect.
                    isYours: character.toLowerCase() == char.toLowerCase() //case sensitive fix
                };
                linesArray.push(currentLineObj);
            } else if (currentLineObj) {
                currentLineObj.text += " " + line;
            }
        });
        // If we successfully found some lines, save them to the app.
        if (linesArray.length > 0) {
            onSave(linesArray); // Send the data up to the main MyApp component.
            setSaved(true); // Update the state so the "Go Practice" button shows up.
        } else {
            // If we couldn't find any names followed by colons, tell the user.
            alert("Format error: Use Name: Line");
        }
    };

    return (
        <div className="main-card">
            <h2 className="card-title">Setup</h2>
            {/* static box of text that explains how to use the app to the user. */}
            <div className="instruction-box">
                <p className="instruction-title">How to Setup Your Script</p>
                <ul className="instruction-list">
                    <li><strong>Step 1:</strong> Enter your character name <strong>EXACTLY</strong> as it appears in the text below.</li>
                    <li><strong>Step 2:</strong> Paste the script using the <strong>Name: Line</strong> format.</li>
                    <li>
                        <strong>Correct Format Example:</strong><br />
                        Juliet: Romeo, Romeo, wherefore art thou Romeo<br />
                        Romeo: Shall I hear more, or shall I speak at this?
                    </li>

                    <li><strong>Step 3:</strong> Click the <strong>Practice</strong> button to start your session.</li>
                </ul>
            </div>

            {/* When the user clicks the button at the bottom, this form triggers the 'handlePractice' function. */}
            <form onSubmit={handlePractice}>
                <div className="form-group">
                    <label className="form-label">My Character Name</label>
                    {/* Controlled inputs - link the value to a state variable and use onChange to update that state every time the user types a letter.*/}
                    <input className="input" type="text" value={char} onChange={(e) => setChar(e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="form-label">Paste Script</label>
                    {/* link the box to our 'text' variable. */}
                    <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} />
                </div>
                {/* This is the trigger for the form. Clicking this runs the 'handlePractice' logic. */}
                <button className="btn-primary" type="submit" style={{ width: '100%' }}>Practice</button>
            </form>

            {/* If the user successfully saved a script, we show a big blue "Go Practice" button to move them to the next screen. */}
            {saved && (
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Go Practice</button>
                </Link>
            )}
        </div>
    );
}

// This component shows the final results, sorting them into "buckets" for the user to review.
function PlayerStats({ ratings, onRunAgain, onPracticeWeak }) {
    // These variables act like switches to show or hide the lists of lines when the user clicks them.
    var [missedOpen, setMissedOpen] = useState(false);
    var [closeOpen, setCloseOpen] = useState(false);

    // Here we take the big list of everything the user did and filter it into smaller, specific lists.
    // We create a list for perfect lines, one for "almost" lines, and one for total misses.
    var nailedLines = ratings.filter(r => r.status == 'Got it');
    var closeLines = ratings.filter(r => r.status == 'Close');
    var missedLines = ratings.filter(r => r.status == 'Missed it');
    // This list catches anything that wasn't perfect, so the user can study just their "weak" spots.
    var weakLines = ratings.filter(r => r.status != 'Got it');

    return (
        <div>
            {/* This grid shows the summary cards. We use .length to find the count for each category. */}
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-value">{nailedLines.length}</div><div className="stat-label">Perfect</div></div>
                <div className="stat-card"><div className="stat-value">{closeLines.length}</div><div className="stat-label">Almost</div></div>
                <div className="stat-card"><div className="stat-value">{missedLines.length}</div><div className="stat-label">Missed</div></div>
            </div>

            {/* We only show this section if there is at least one missed line to look at. */}
            {missedLines.length > 0 && (
                <div className="list-wrapper">
                    {/* When this header is clicked, it "toggles" the missedOpen variable between true and false. */}
                    <div className="list-header review" onClick={() => setMissedOpen(!missedOpen)}>
                        <p>Review Missed Lines: {missedLines.length}</p>
                        {/* The label changes from 'Show' to 'Hide' automatically based on the state. */}
                        <span>{missedOpen ? 'Hide' : 'Show'}</span>
                    </div>
                    {/* Using index 'i' as key */}
                    {missedOpen && missedLines.map((l, i) => (
                        <div className="list-item" key={i}><p>{l.text}</p></div>
                    ))}
                </div>
            )}

            {/* Almost Section*/}
            {closeLines.length > 0 && (
                <div className="list-wrapper">
                    {/* Toggles the 'closeOpen' switch to show or hide this specific list. */}
                    <div className="list-header" onClick={() => setCloseOpen(!closeOpen)}>
                        <p>Review Almost Lines: {closeLines.length}</p>
                        <span>{closeOpen ? 'Hide' : 'Show'}</span>
                    </div>
                    {/* Using index 'i' as key */}
                    {/* Loops through the 'closeLines' list and displays them on the page. */}
                    {closeOpen && closeLines.map((l, i) => (
                        <div className="list-item" key={i}><p>{l.text}</p></div>
                    ))}
                </div>
            )}

            {/* Summary Box: The final actions the user can take. */}
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

// Logic Component - This is the top-level component that manages all the data.
export default function MyApp() {
    {/* Global State: These variables hold the script and the user's progress so they can be shared across all screens. */ }
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

    {/* This function handles saving a new script. */ }
    var saveScript = (data) => {
        setFullScript(data); // Save the original copy.
        setScript(data); // Set the current practice copy.
        setRatings([]); // Reset the scores to zero.
        localStorage.setItem("runLines_script", JSON.stringify(data));
    };

    {/* Resets the session so the user can try the whole thing again. */ }
    var handleRunAgain = () => {
        setScript(fullScript);
        setRatings([]);
    };

    {/* This is the "Study Weak Lines" logic. It creates a custom practice session using only the lines the user struggled with. */ }
    var handlePracticeWeak = () => {
        // Step 1: Find the text of every line that wasn't 'Perfect.'
        var weakLinesText = ratings.filter(r => r.status != 'Got it').map(r => r.text);
        // Step 2: Filter the whole script. 
        var weakOnlyScript = fullScript.filter(l => {
            // Keep lines from other characters so the user still has their 'cues.'
            if (!l.isYours) return true;
            // For the user's lines, only keep the ones we identified as 'weak.'
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
                    {/* The main practice screen */}
                    <Route path="/" element={<Game script={script} ratings={ratings} setRatings={setRatings} />} />
                    {/* The script input screen */}
                    <Route path="/settings" element={<Settings onSave={saveScript} />} />
                    {/* The results screen */}
                    <Route path="/stats" element={<PlayerStats ratings={ratings} onRunAgain={handleRunAgain} onPracticeWeak={handlePracticeWeak} />} />                </Routes>
            </div>
        </div>
    );
}