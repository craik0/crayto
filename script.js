/* General Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}

/* Body Styling */
body {
    background: #fff;
    color: #000;
    text-align: center;
    padding: 20px;
}

/* Navigation Bar */
nav ul {
    background: lightblue;
    padding: 10px;
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 20px;
}

nav ul li {
    display: inline;
}

nav ul li a {
    text-decoration: none;
    color: black;
    font-weight: bold;
    padding: 10px 15px;
}

nav ul li a:hover {
    background-color: black;
    color: white;
    border-radius: 5px;
}

/* Main Container */
.container {
    margin-top: 50px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

/* Headings */
h1 {
    font-size: 2rem;
    margin-bottom: 10px;
}

.subtitle {
    font-size: 1.2rem;
    color: #555;
}

/* Playlists */
.playlist {
    margin: 20px 0;
}

iframe {
    max-width: 100%;
}

/* 404 Error Page */
.error-container {
    text-align: center;
    margin-top: 100px;
}

.error-container button {
    padding: 10px 15px;
    background: lightblue;
    border: none;
    color: black;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 20px;
}

.error-container button:hover {
    background: black;
    color: white;
}

/* About Page */
.about-container {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 800px;
    margin: 50px auto;
    text-align: left;
    gap: 20px;
    flex-wrap: wrap; /* Makes it responsive */
}

.about-img {
    width: 150px;
    height: auto;
    border-radius: 10px;
}

.about-text {
    flex: 1;
    text-align: left;
}

/* Happy Link on Home Page */
.happy-link {
    margin-top: 20px;
}

.happy-link a {
    display: inline-block;
    font-size: 1.2rem;
    font-weight: bold;
    color: lightblue;
    text-decoration: none;
    padding: 10px 15px;
    border: 2px solid lightblue;
    border-radius: 5px;
    transition: all 0.3s ease;
}

.happy-link a:hover {
    background: lightblue;
    color: black;
    text-decoration: none;
}

/* Responsive Design */
@media (max-width: 768px) {
    .about-container {
        flex-direction: column;
        text-align: center;
    }
    
    .about-text {
        text-align: center;
    }
}
