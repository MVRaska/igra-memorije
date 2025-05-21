const inputUsername = document.getElementById('username');
const radios = document.querySelectorAll('input[type="radio"]');
const imgs = document.querySelectorAll('img');
const backsideDisplay = document.getElementById('backsideDisplay');
const imageDisplay = document.getElementById('imageDisplay');
const span = document.querySelector('span');
const btns = document.querySelectorAll('button');

const imageSources = [];
for (let i = 0; i < 50; i++) {
    imageSources[i] = i + 1;
}

const shuffle = arr => {
    const shuffled = [];
    for (let i = arr.length; i > 0; i--) {
        const index = Math.floor(Math.random() * i);
        shuffled[i - 1] = arr[index];
        arr[index] = arr[i - 1];
    }
    return shuffled;
};

const shuffledSources = shuffle(imageSources);
let cardPairs = [];

const generateImages = pairCount => {
    cardPairs = shuffledSources.slice(0, pairCount);
    cardPairs = cardPairs.concat(cardPairs);
    const shuffledCards = shuffle(cardPairs);

    for (let i = 0; i < shuffledCards.length; i++) {
        const img = document.createElement('img');
        img.src = `img/${shuffledCards[i]}.png`;
        img.style.margin = img.style.width * 0.07;
        imageDisplay.appendChild(img);
        if ((i + 1) % Math.sqrt(2 * pairCount) === 0) {
            imageDisplay.appendChild(document.createElement('br'));
        }
    }
};

const generateBackside = pairCount => {
    for (let i = 0; i < 2 * pairCount; i++) {
        const img = document.createElement('img');
        img.src = 'img/bg1.jpg';
        backsideDisplay.appendChild(img);
        if ((i + 1) % Math.sqrt(2 * pairCount) === 0) {
            backsideDisplay.appendChild(document.createElement('br'));
        }
    }
};

const setCardSize = difficulty => {
    const images = document.querySelectorAll('img');
    let widthPercent;

    switch (difficulty) {
        case 'easy':
            widthPercent = 20;
            break;
        case 'medium':
            widthPercent = 14;
            break;
        case 'hard':
            widthPercent = 10;
            break;
        case 'expert':
            widthPercent = 9;
            break;
        default:
            widthPercent = 20;
    }

    images.forEach(img => {
        img.style.width = `${widthPercent}%`;
        img.style.height = `auto`;
        img.style.marginRight = `${widthPercent * 0.1}%`;
        img.style.marginBottom = `${widthPercent * 0.06}%`;
    });
};

generateBackside(8);
generateImages(8);
setCardSize('easy');

let timer;
let seconds = -1;
let matchedPairs = [];
let clickCount = 0;

const generateBoard = () => {
    imageDisplay.innerHTML = '';
    backsideDisplay.innerHTML = '';
    matchedPairs = [];
    clickCount = 0;

    timer = setInterval(() => {
        seconds++;
        span.innerHTML = seconds;
    }, 1000);

    radios.forEach(radio => {
        if (radio.value === 'easy' && radio.checked) {
            generateBackside(8);
            generateImages(8);
            setCardSize('easy');
        } else if (radio.value === 'medium' && radio.checked) {
            generateBackside(18);
            generateImages(18);
            setCardSize('medium');
        } else if (radio.value === 'hard' && radio.checked) {
            generateBackside(32);
            generateImages(32);
            setCardSize('hard');
        } else if (radio.value === 'expert' && radio.checked) {
            generateBackside(50);
            generateImages(50);
            setCardSize('expert');
        }
    });
};

inputUsername.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (inputUsername.value !== '' && inputUsername.value.length < 20) {
            if (timer) {
                clearInterval(timer);
                seconds = -1;
            }
            generateBoard();
        } else {
            alert('Invalid username!');
        }
    }
});

radios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (inputUsername.value !== '' && inputUsername.value.length < 20) {
            if (timer) {
                clearInterval(timer);
                seconds = -1;
            }
            generateBoard();
        } else {
            alert('Invalid username!');
        }
    });
});

let openCards = [];
let clickedBacksides = [];
let gameActive = true;
let confirmNewGame;
let users = JSON.parse(localStorage.getItem('users')) || [];

backsideDisplay.addEventListener('click', e => {
    if (e.target.tagName === 'IMG' && gameActive && inputUsername.value !== '' && inputUsername.value.length < 20) {
        const backside = e.target;
        const index = Array.from(backside.parentNode.children).indexOf(backside);
        backside.classList.add('disabled');
        clickedBacksides.push(backside);

        const frontImage = imageDisplay.children[index];
        openCards.push(frontImage);

        clickCount++;

        if (clickCount === 2) {
            gameActive = false;

            if (openCards[0].src !== openCards[1].src) {
                setTimeout(() => {
                    clickedBacksides.forEach(bg => {
                        bg.classList.remove('disabled');
                    });
                    openCards = [];
                    clickedBacksides = [];
                    clickCount = 0;
                    gameActive = true;
                }, 1000);
            } else {
                matchedPairs.push(1);
                openCards = [];
                clickedBacksides = [];
                clickCount = 0;
                gameActive = true;

                setTimeout(() => {
                    radios.forEach(radio => {
                        if (
                            (radio.value === 'easy' && radio.checked && matchedPairs.length === 8) ||
                            (radio.value === 'medium' && radio.checked && matchedPairs.length === 18) ||
                            (radio.value === 'hard' && radio.checked && matchedPairs.length === 32) ||
                            (radio.value === 'expert' && radio.checked && matchedPairs.length === 50)
                        ) {
                            confirmNewGame = window.confirm('Game over! Do you want to start a new game?');
                            matchedPairs = [];

                            const user = {
                                name: inputUsername.value,
                                difficulty: radio.value,
                                time: seconds
                            };

                            users = JSON.parse(localStorage.getItem('users')) || [];
                            users.push(user);
                            if (users.length > 40) {
                                users.shift();
                            }
                            localStorage.setItem('users', JSON.stringify(users));

                            clearInterval(timer);
                            seconds = -1;

                            const topUsers = JSON.parse(localStorage.getItem('users')) || [];
                            const filtered = {
                                easy: [],
                                medium: [],
                                hard: [],
                                expert: []
                            };

                            topUsers.forEach(u => {
                                filtered[u.difficulty].push(u);
                            });

                            let sorted;
                            radios.forEach(r => {
                                if (r.value === 'easy' && r.checked) {
                                    sorted = sortByTime(filtered.easy);
                                    if (user.time < Math.min(...filtered.easy.map(u => u.time))) {
                                        alert("Congratulations! Best time in 'easy' difficulty!");
                                    }
                                } else if (r.value === 'medium' && r.checked) {
                                    sorted = sortByTime(filtered.medium);
                                    if (user.time < Math.min(...filtered.medium.map(u => u.time))) {
                                        alert("Congratulations! Best time in 'medium' difficulty!");
                                    }
                                } else if (r.value === 'hard' && r.checked) {
                                    sorted = sortByTime(filtered.hard);
                                    if (user.time < Math.min(...filtered.hard.map(u => u.time))) {
                                        alert("Congratulations! Best time in 'hard' difficulty!");
                                    }
                                } else if (r.value === 'expert' && r.checked) {
                                    sorted = sortByTime(filtered.expert);
                                    if (user.time < Math.min(...filtered.expert.map(u => u.time))) {
                                        alert("Congratulations! Best time in 'expert' difficulty!");
                                    }
                                }
                            });

                            for (let i = 0; i < 5; i++) {
                                document.getElementById(`name${i + 1}`).innerHTML = sorted[i] ? sorted[i].name : '';
                                document.getElementById(`time${i + 1}`).innerHTML = sorted[i] ? sorted[i].time : '';
                            }

                            if (confirmNewGame) {
                                generateBoard();
                            }
                        }
                    });
                }, 10);
            }
        }
    }
});

const sortByTime = arr => {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i; j < arr.length; j++) {
            if (arr[i].time > arr[j].time) {
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
    }
    return arr;
};

const top5 = difficulty => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filtered = users.filter(u => u.difficulty === difficulty);
    const sorted = sortByTime(filtered);

    for (let i = 0; i < 5; i++) {
        document.getElementById(`name${i + 1}`).innerHTML = sorted[i] ? sorted[i].name : '';
        document.getElementById(`time${i + 1}`).innerHTML = sorted[i] ? sorted[i].time : '';
    }

    btns.forEach(b => b.classList.remove('btnChecked'));
    const activeBtn = document.querySelector(`button[id=${difficulty}]`);
    if (activeBtn) {
        activeBtn.classList.add('btnChecked');
    }
};

top5('easy');

btns.forEach(btn => {
    btn.addEventListener('click', () => {
        top5(btn.id);
    });
});

radios.forEach(radio => {
    radio.addEventListener('click', () => {
        top5(radio.id);
    });
});

