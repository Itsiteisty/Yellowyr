const state = {
  room: 'foyer',
  sanity: 100,
  inventory: new Set(),
  seconds: 300,
  timerId: null,
};

const rooms = {
  foyer: {
    title: 'Entrada',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80',
    text: 'A porta bate atrás de você. O rádio antigo chia uma frase: “três coisas abrem a saída”.',
    choices: [
      ['Ir para a cozinha', 'kitchen', -7],
      ['Subir a escada', 'hallway', -10],
      ['Olhar o quadro torto', 'portrait', -4],
    ],
  },
  kitchen: {
    title: 'Cozinha fria',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    text: 'Panelas pendem do teto. Dentro do forno apagado há uma chave enferrujada.',
    item: 'chave enferrujada',
    choices: [
      ['Pegar a chave e voltar', 'foyer', -5],
      ['Descer para o porão', 'basement', -14],
    ],
  },
  hallway: {
    title: 'Corredor de retratos',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    text: 'Todos os retratos viram os olhos ao mesmo tempo. Um deles aponta para o sótão.',
    choices: [
      ['Entrar no quarto trancado', 'bedroom', -8, 'chave enferrujada'],
      ['Abrir o alçapão do sótão', 'attic', -15],
      ['Voltar correndo', 'foyer', -6],
    ],
  },
  portrait: {
    title: 'O quadro torto',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=80',
    text: 'Atrás do quadro há uma foto que não deveria existir: você dormindo nesta casa.',
    item: 'foto marcada',
    choices: [['Guardar a foto', 'foyer', -11]],
  },
  basement: {
    title: 'Porão do gerador',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    text: 'O gerador está coberto de poeira. Você puxa a alavanca e a casa grita pelas paredes.',
    item: 'gerador ligado',
    choices: [['Voltar para a entrada', 'foyer', -16]],
  },
  bedroom: {
    title: 'Quarto proibido',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
    text: 'Debaixo do travesseiro há a chave do portão. Algo arranha o armário por dentro.',
    item: 'chave do portão',
    choices: [['Correr para a entrada', 'foyer', -18]],
  },
  attic: {
    title: 'Sótão',
    image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=1600&q=80',
    text: 'Uma boneca sem rosto segura um bilhete: “a luz acorda a saída”.',
    choices: [['Descer sem olhar para trás', 'hallway', -12]],
  },
};

const $ = (selector) => document.querySelector(selector);

function setScene(roomKey) {
  const room = rooms[roomKey];
  state.room = roomKey;
  if (room.item) state.inventory.add(room.item);

  $('#game').style.backgroundImage = `radial-gradient(circle at center, rgba(8, 6, 6, 0.18), rgba(0, 0, 0, 0.92)), url('${room.image}')`;
  $('#storyTitle').textContent = room.title;
  $('#storyText').textContent = room.text;
  $('#roomName').textContent = room.title;
  $('#sanity').textContent = Math.max(0, state.sanity);
  $('#inventory').textContent = state.inventory.size ? [...state.inventory].join(', ') : 'vazio';
  $('#game').classList.toggle('danger', state.sanity <= 35);

  const choices = $('#choices');
  choices.innerHTML = '';

  if (canEscape()) {
    addChoice('Abrir o portão e sobreviver', () => endGame(true));
  }

  room.choices.forEach(([label, target, cost, requiredItem]) => {
    addChoice(requiredItem && !state.inventory.has(requiredItem) ? `${label} (precisa de ${requiredItem})` : label, () => {
      if (requiredItem && !state.inventory.has(requiredItem)) {
        drain(9);
        $('#storyText').textContent = 'A maçaneta não gira. A presença atrás de você fica mais perto.';
        renderStats();
        return;
      }
      drain(Math.abs(cost));
      if (state.sanity <= 0) return endGame(false);
      setScene(target);
    });
  });
}

function addChoice(label, action) {
  const button = document.createElement('button');
  button.className = 'button button--ghost';
  button.textContent = label;
  button.addEventListener('click', action);
  $('#choices').append(button);
}

function drain(amount) {
  state.sanity = Math.max(0, state.sanity - amount);
}

function canEscape() {
  return state.room === 'foyer'
    && state.inventory.has('gerador ligado')
    && state.inventory.has('chave do portão');
}

function renderStats() {
  $('#sanity').textContent = state.sanity;
  $('#inventory').textContent = state.inventory.size ? [...state.inventory].join(', ') : 'vazio';
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.seconds -= 1;
    const minutes = String(Math.floor(state.seconds / 60)).padStart(2, '0');
    const seconds = String(state.seconds % 60).padStart(2, '0');
    $('#timer').textContent = `${minutes}:${seconds}`;
    if (state.seconds <= 0) endGame(false);
  }, 1000);
}

function endGame(won) {
  clearInterval(state.timerId);
  $('#storyTitle').textContent = won ? 'Você escapou' : 'A casa ficou com você';
  $('#storyText').textContent = won
    ? 'O portão range e se abre para a madrugada. Atrás de você, a mansão apaga todas as janelas.'
    : 'A lanterna falha. Quando a luz volta, seu nome aparece em mais um retrato da parede.';
  $('#choices').innerHTML = '';
  addChoice('Jogar novamente', startGame);
}

function startGame() {
  state.sanity = 100;
  state.seconds = 300;
  state.inventory = new Set();
  $('#menu').classList.add('hidden');
  $('#instructions').classList.add('hidden');
  $('#hud').classList.remove('hidden');
  $('#story').classList.remove('hidden');
  $('#timer').textContent = '05:00';
  startTimer();
  setScene('foyer');
}

$('#startButton').addEventListener('click', startGame);
$('#howButton').addEventListener('click', () => {
  $('#menu').classList.add('hidden');
  $('#instructions').classList.remove('hidden');
});
$('#backButton').addEventListener('click', () => {
  $('#instructions').classList.add('hidden');
  $('#menu').classList.remove('hidden');
});
