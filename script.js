let myLibrary = [];

window.addEventListener('load', updateUI);

document.querySelector('.modal-outter').addEventListener('click', toggleModal);
document.querySelector('.modal-inner').addEventListener('click', event => event.stopPropagation());
document.querySelector('.close-button').addEventListener('click', toggleModal);

document.getElementById('save-button').addEventListener('click', saveLibrary);
document.getElementById('select-file').addEventListener('change', loadLibrary);
document.getElementById('add-button').addEventListener('click', () => {
  addBook();
  toggleModal();
});

document.forms.bookform.addEventListener('submit', (event) => {
  event.preventDefault();
  submitBook();
  toggleModal();
  updateUI();
});

function Book([title, author, pages, read, cover]) {
  this.title = title
  this.author = author
  this.pages = pages
  this.read = read
  this.cover = cover
};

//  open the book form
function addBook() {
  const form = document.forms.bookform;
  form.setAttribute('data-index', `${myLibrary.length}`);
  form.reset();
};

//  open the book form and populate it with book info
function editBook(button) {
  const index = button.closest('.card').getAttribute('tabindex');
  const book = myLibrary[index];
  const form = document.forms.bookform;

  form.setAttribute('data-index', `${index}`);

  for (let element of form) {
    if (element.name == "read") {
      for (let radio of document.bookform.read) {
        if (radio.value == book.read) {
          radio.checked = true;
        };
      };
    } else {
      for (let key in book) {
        if (element.name == key) {
          element.value = book[key];
        };
      };
    };
  };
};

//  handle the submission of the book form
function submitBook() {
  const form = document.forms.bookform;
  const data = new FormData(form);
  const book = new Book([...data.values()]);
  console.log(...data.values());
  const index = form.getAttribute('data-index');
  (index < myLibrary.length) ? myLibrary[index] = book : myLibrary.push(book);
};

//  delete a book from the library
function deleteBook(button) {
  const index = button.closest('.card').getAttribute('tabindex');
  myLibrary.splice(index, 1);
};

//  updates the card grid
function updateUI() {
  const cardGrid = document.querySelector('.card-grid');

  while (cardGrid.children.length > 1) {
    cardGrid.removeChild(cardGrid.firstChild);
  };

  for (let book of myLibrary) {
    const card = createCard(book);
    cardGrid.insertBefore(card, cardGrid.lastChild);
  };
};

//  toggle modal
function toggleModal() {
  const modal = document.querySelector('.modal-outter');
  modal.classList.toggle('open');
};

//  read text file content
function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = x => resolve(reader.result);
    reader.readAsText(file);
  });
};

//  load library from local json file
async function loadLibrary() {
  data = await readFile(this.files[0]);
  data = JSON.parse(data);

  for (let obj of data) {
    const book = new Book([...Object.values(obj)]);
    myLibrary.push(book);
  };

  updateUI();
};

//  save library to local json file
function saveLibrary() {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify(myLibrary)], {type: 'text/plain'});
  a.href = URL.createObjectURL(file);
  a.download = 'myLibrary'+Date.now()+'.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

//  create the UI element for the book
function createCard(book) {
// -----------------------
//  card front
// -----------------------
  const index = myLibrary.indexOf(book);

  const cardDefaultImage = document.createElement('div');
  cardDefaultImage.classList.add('card-default');
  const cardIcon = document.createElement('div');
  cardIcon.classList.add('material-icons');
  cardIcon.innerText = 'menu_book';
  const cardText = document.createElement('p');
  cardText.classList.add('card-default-text');
  cardText.innerText = 'NO COVER AVAILABLE';
  cardDefaultImage.appendChild(cardIcon);
  cardDefaultImage.appendChild(cardText);

// create front image
  const cardImage = document.createElement('img');
  cardImage.classList.add('card-image');
  cardImage.setAttribute('src', `${book.cover}`);
  cardImage.addEventListener('error', (event) => {
    event.target.replaceWith(cardDefaultImage);
  });

// create overlay title
  const cardTitle = document.createElement('p');
  cardTitle.classList.add('card-title');
  cardTitle.innerText = book.title;

// create overlay author
  const cardAuthor = document.createElement('p');
  cardAuthor.classList.add('card-author');
  cardAuthor.innerText = `by ${book.author}`;

// create overlay pages
  const cardPages = document.createElement('p');
  cardPages.classList.add('card-pages');
  cardPages.innerText = `Number of pages: ${book.pages}`;

// create overlay and append paragraphs
  const cardOverlay = document.createElement('div');
  cardOverlay.classList.add('card-overlay');
  if (book.read == "true") {
    cardOverlay.classList.add('card-read');
  };
  if (book.read == "false") {
    cardOverlay.classList.add('card-not-read');
  };
  cardOverlay.appendChild(cardTitle);
  cardOverlay.appendChild(cardAuthor);
  cardOverlay.appendChild(cardPages);

// create card front and append content
  const cardFront = document.createElement('div');
  cardFront.classList.add('card-front');
  cardFront.appendChild(cardImage);
  cardFront.appendChild(cardOverlay);
  cardFront.addEventListener('click', () => {
    card.focus();
  });

// -----------------------
// card back
// -----------------------

// create edit button
  const cardEditBtn = document.createElement('span');
  cardEditBtn.classList.add('material-icons');
  cardEditBtn.innerText = 'edit';
  cardEditBtn.addEventListener('click', event => {
    editBook(event.target);
    toggleModal();
  });

// create delete button
  const cardDeleteBtn = document.createElement('span');
  cardDeleteBtn.classList.add('material-icons');
  cardDeleteBtn.innerText = 'delete';
  cardDeleteBtn.addEventListener('click', event => {
    deleteBook(event.target);
    updateUI();
  });

// create card back and append buttons
  const cardBack = document.createElement('div');
  cardBack.classList.add('card-back');
  cardBack.appendChild(cardEditBtn);
  cardBack.appendChild(cardDeleteBtn);
  cardBack.addEventListener('mouseleave', () => {
    card.blur();
  });

// create button and append front and back
  const card = document.createElement('div');
  card.classList.add('card');
  card.setAttribute('tabindex', `${index}`);
  card.appendChild(cardFront);
  card.appendChild(cardBack);

  return card;
};