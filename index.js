let answer = "potluck" 
let guessCount = 0
answer = answer.toUpperCase()
const guessAlert = document.getElementById('guessAlert') //used to print helper text if the user inputs guesses of the wrong length or an invalid word
const guessField = document.getElementById('playerGuess') //the field in which the user types their answer
const capitulateButton = document.getElementById('capitulate-button')

const deleteLastEnteredLetter = () =>{
    guessField.value = guessField.value.slice(0,-1)
    updatePrintedGuessLength();

}

//allow the user to click on the visual keyboard letters to form their gues
const visualKeyboard = document.querySelectorAll('.key')
visualKeyboard.forEach(key =>{
    key.addEventListener('click',function(){
        console.log(key.id)
        if (key.id === 'back'){
            console.log("Backspace key pressed")
            deleteLastEnteredLetter()
        } else {
            guessField.value += key.id.toUpperCase();
            updatePrintedGuessLength()
        }
    })
})

//define a guess button and a function to check the guess
const checkGuessButton = document.getElementById('checkGuessButton')
checkGuessButton.addEventListener("click",function(){
    submitGuess()
})

//enable the user to submit their guess with the enter button
const inputField = document.getElementById('playerGuess')
document.body.addEventListener('keypress', function(event){
    if (event.code === 'Enter'){
        submitGuess();
    }
})

const updatePrintedGuessLength = event => {
    if (event.key !== "Enter"){
        guessAlert.innerText = "Guess Length: " + guessField.value.length    
    }
    
}

inputField.addEventListener('keyup',updatePrintedGuessLength)


const submitGuess = async () =>{     
    guessAlert.innerText = ''
    let guess = guessField.value.toUpperCase()
   if (guess.length != answer.length){
       guessAlert.innerText = "ERROR: Guesses should be " + answer.length + " characters in length."
   } else {
       guessAlert.innerText = "You guessed: " + guess
       const isValidWord = await checkForValidWord(guess)
       if(isValidWord){
            checkGuess(guess)
       } else {
        console.error("User guessed an invalid word")
        guessAlert.innerText = guess + " is not a recognized word."
       }
   }

   guessField.value = ''
}

const checkForValidWord = async guess => {
    try{
        const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + guess)
        if (response.status !== 404){
            console.log("valid word!")
            return true     
        }   
    } catch (error) {
        console.error(error)
    }
    
}

const showCapitulateButton = () =>{
    capitulateButton.classList.remove('hide')
}

capitulateButton.addEventListener('click',function(){
    guessAlert.innerText = "No worries! The answer was: " + answer
})

const checkGuess = guess => {
    guessCount++;
    const resultsHolder = document.getElementById('guessesContainer') //a place to print all of the results as 
    const thisGuessResults = document.createElement('div') //and a place to put the results for this guess
    thisGuessResults.classList.add('guess-result')
    const printGuessCount = document.createElement('div') //and a place to print the guess number
    printGuessCount.classList.add('guess-count') // + relevant styling
    printGuessCount.innerText += guessCount + " " //and finally print the guess number in that new element
    if (guessCount >= 5){
        showCapitulateButton()
    }
    thisGuessResults.appendChild(printGuessCount)
    resultsHolder.appendChild(thisGuessResults)
    let answerArray = answer.split('') //the answer and the guess must be in arrays
    let guessArray = guess.split('')  //so that we can iterate over them
    let correctLetters = 0 //success is determined when this matches the letters in the answer
    for (let i = 0; i < guess.length; i++){ 
        let almostMatch = false; //to track whether each checked letter will turn yellow
        let exactMatch = false; //or green
        if (guessArray[i] === answerArray[i]){ //check for exact match
            const resultElement = document.createElement('div')
            resultElement.classList.add('letter-outcome', 'letter-match')
            resultElement.innerText = guessArray[i]
            thisGuessResults.appendChild(resultElement)
            exactMatch = true;
            correctLetters++
        } else if (answerArray.includes(guessArray[i])){ //check for a correct letter in the incorrect place
            const resultElement = document.createElement('div')
            resultElement.classList.add('letter-outcome', 'letter-almost')
            resultElement.innerText = guessArray[i]
            thisGuessResults.appendChild(resultElement);
            almostMatch = true;
        } else { //letter must not be in the answer
            const resultElement = document.createElement('div')
            resultElement.classList.add('letter-outcome')
            resultElement.innerText = guessArray[i]
            thisGuessResults.appendChild(resultElement)
        }

        toggleKeyboardLetterColors(guessArray[i], exactMatch, almostMatch)
    }
    if (correctLetters == answer.length){
        const successText = document.createElement('h2')
        successText.innerText+= "CORRECT!"
        resultsHolder.appendChild(successText)
    }
}

//indicate on the visual keyboard if the checked letters are in the word or not
const toggleKeyboardLetterColors = (letter, exactMatch, almostMatch) => {
    letter = letter.toLowerCase()
    const letterToMark = document.getElementById(`${letter}`)
    if (exactMatch){
        if (letterToMark.classList.contains('letter-almost')){
            letterToMark.classList.remove('letter-almost');
        }
        letterToMark.classList.add('letter-match')
    } else if (almostMatch){
        if (!letterToMark.classList.contains('letter-match')){
            letterToMark.classList.add('letter-almost')
        }
        
    } else {
        letterToMark.classList.add('letter-not-present')
    }
}

const getArrayOfRandomWords = async () =>{
    try{
        const params = "length=6&lang=en&number=5"
        const response = await fetch('https://random-word-api.herokuapp.com/word?' + params)
        const responseArray = await response.json()
        selectRandomAnswer(responseArray)
    } catch (error) {
        console.error(error)
    }

}

const selectRandomAnswer = async(choices) =>{
    console.log(choices)
    const randomIndex = Math.floor(Math.random() * (4 + 1))
    console.log("Selected Answer: " + choices[randomIndex])
    answerCandidate = choices[randomIndex].toUpperCase()
    choices.splice(randomIndex,1)
    console.log(choices)
    const isAnswerCandidateAValidWord = await checkForValidWord(answerCandidate)
    if (isAnswerCandidateAValidWord){
        console.log("Random API word is valid. Proceeding")
        answer = answerCandidate
         //allow for dynamic word lengths by setting the guess label here
        const labelElement = document.getElementById('playerGuessLabel')
        labelElement.textContent = "Guess a word with " + answer.length + " letters"
        //makeAutomatedGuesses(choices)
    } else {
        console.error("The random word API returned a word not found in the dictionary lookup API. Select another")
        getArrayOfRandomWords();
    }
}

//we had this idea that the word could be like 8 letters long and then you'd give a few guesses for free. This method is used in that idea
const makeAutomatedGuesses = async(guessOptions) => {
    let guessesMade = 0
    for (let i = 0; i < guessOptions.length; i++){
        const isGuessAValidWord = await checkForValidWord(guessOptions[i])
        if (isGuessAValidWord){
            checkGuess(guessOptions[i].toUpperCase())
            guessesMade++
        } else {
        console.log("Not guessing " + guessOptions[i] + " because it's not in the dictionary")
        }
    }
    
}

const useHardCodedAnswer = bool =>{
    if (bool){
        const labelElement = document.getElementById('playerGuessLabel')
        labelElement.textContent = "Guess a word with " + answer.length + " letters"
    } else {
        getArrayOfRandomWords()
    }
}

useHardCodedAnswer(true)