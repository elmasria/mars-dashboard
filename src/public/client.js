// add our markup to the page
const root = document.getElementById('root')

const updateStore = async (cRoot, cStore, newState = {}) => {
    const newStore = cStore.mergeDeep(newState);    
    await render(cRoot, newStore)
}

const render = async (cRoot, state) => {
    cRoot.innerHTML = App(cRoot, state)
}
 
// create content
const App = (cRoot, state) => {
    const user = state.get('user')
    const rovers = state.get('rovers') 
    const selectedRover = state.get('selectedRover') 
    const roversHtml = rovers && rovers.map((rover) => generateCard(state, rover)).join('')  
    const selected = !!selectedRover
    return `
        <header class="container-fluid">
            Mars Dashboard
        </header>
        <main class="container-fluid">     
            <div class="jumbotron"> 
                ${Greeting(user.get('name'))}
                <p class="lead">Mars rover dashboard that consumes the NASA API</p>                            
            </div> 

            <div class="row">
                ${rovers && roversHtml || spinner()}
            </div>

            ${
                selected ? selectedRover.get('name') : ''
            }
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    const store = Immutable.Map({
        user: Immutable.Map({ name: "Student" }), 
        selectedRover: false,
    })
    render(root, store)
    getListOfRovers((data) => {
        console.log(data);
        const rovers = Immutable.Map({
            rovers: Immutable.fromJS(data.rovers)  
        })        
        updateStore(root, store, rovers)
    })
    
})

const Greeting = (name) => {
    if (name) {
        return `
            <h1 class="display-4">Welcome, ${name}!</h1>
        `
    }

    return `
        <h1 class="display-4">Hello!</h1>
    `
}

const spinner = () => {
    return `
        <div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status">
            <span class="sr-only">Loading...</span>
        </div> 
    `
}

const generateCard = (store, rover) => {
    return (`
        <div class="col-sm-6 mb-2">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${rover.get('name')}</h5>
                    <p class="card-text">This rover launched in ${rover.get('launch_date')}, land in Mars in ${rover.get('landing_date')} and is now ${rover.get('status')}</p>
                    <button  class="btn btn-primary" onclick="displayRover(${toStrArgs(store)}, ${toStrArgs(rover)})">See Latest Image</button>
                </div>
            </div>
        </div>       
    `)
}

const toStrArgs = (args) => {
    return JSON.stringify(args).replace(/"/g, '\'')
}
 
const displayRover = (store, data) => {
    const selectedRover = Immutable.Map({
        selectedRover: Immutable.fromJS(data)
    })  
    
    updateStore(root, Immutable.fromJS(store), selectedRover)
}

const getListOfRovers = (callback) => {
    fetch(`http://localhost:3000/rovers`)
        .then(res => res.json())
        .then(json => callback(json))
}

const getRoverData = (roverName, callback) => {
    fetch(`http://localhost:3000/rovers/${roverName}`)
        .then(res => res.json())
        .then(json => callback(json))
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (apod.image && `
            <img src="${apod.image.url}" class="card-img-top" alt="rover image" />            
        `)
    }
}

// ------------------------------------------------------  API CALLS
// updateStore(store, { apod })
// Example API call
const getImageOfTheDay = async (state) => {
    try {
        const results = await fetch(`http://localhost:3000/apod`);
        const json = await results.json();
        return json;

    } catch (error) {
        console.error(error);
        return false;
    }   
}
