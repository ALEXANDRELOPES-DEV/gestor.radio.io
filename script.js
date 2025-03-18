import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyByCJr1sfLF6VaVfha1x4Pwdm_SsY_OV2g",
  authDomain: "gestor-radios.firebaseapp.com",
  projectId: "gestor-radios",
  storageBucket: "gestor-radios.firebasestorage.app",
  messagingSenderId: "332621016032",
  appId: "1:332621016032:web:c789a83fdde1d511f65985",
  measurementId: "G-VM46RBLTW4"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const users = {
  "alexandre": "2013",
  "clovis": "2028",
  "patricio": "2015",
  "Roberto": "2099",
  "magno": "2014",
  "Douglas": "2024",
};

window.login = async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (users[username] && users[username] === password) {
    alert('Logado com sucesso!');
    setEditable(true);
    await carregarItens(); // Carregar itens após login bem-sucedido
  } else {
    alert('ID ou Senha incorretos.');
  }
};

window.logout = async function logout() {
  alert('Deslogado com sucesso!');
  await salvarAlteracoes(); // Salvar alterações antes de deslogar
  setEditable(false);
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  limparItens(); // Limpar itens ao fazer logout
  await carregarItens(); // Recarregar itens para mostrar as informações
};

function setEditable(editable) {
  const problemInputs = document.querySelectorAll('.problem-input');
  const dateInputs = document.querySelectorAll('.date input');

  problemInputs.forEach(input => {
    input.disabled = !editable;
  });

  dateInputs.forEach(input => {
    input.disabled = !editable;
  });
}

// Função para salvar alterações ao editar
window.salvarAlteracoes = async function salvarAlteracoes() {
  const itens = [];

  document.querySelectorAll('tbody tr').forEach((tr, index) => {
    const problemInput = tr.querySelector('.problem-input');
    const dateInput = tr.querySelector('.date input');

    if (problemInput && dateInput) {
      const problema = problemInput.value;
      const data = dateInput.value;
      itens.push({ index: index + 1, problema, data });
    }
  });

  try {
    await setDoc(doc(db, "itens", "itensData"), { itens });
    alert('Alterações salvas com sucesso!');
  } catch (error) {
    console.error("Erro ao salvar no Firestore: ", error);
    alert('Erro ao salvar alterações.');
  }
};

// Função para carregar itens do Firestore
async function carregarItens() {
  try {
    const docSnap = await getDoc(doc(db, "itens", "itensData"));
    if (docSnap.exists()) {
      const itens = docSnap.data().itens;

      itens.forEach((item, index) => {
        const tr = document.querySelector(`tbody tr:nth-child(${index + 1})`);
        if (tr) {
          const problemInput = tr.querySelector('.problem-input');
          const dateInput = tr.querySelector('.date input');
          
          if (problemInput) {
            problemInput.value = item.problema ?? '';
            atualizarGIF(problemInput); // Atualizar GIF
          }

          if (dateInput) {
            dateInput.value = item.data ?? '';
          }
        }
      });
    } else {
      console.log("Nenhum documento encontrado!");
    }
  } catch (error) {
    console.error("Erro ao carregar do Firestore: ", error);
  }
}

// Função para limpar itens na tabela
function limparItens() {
  document.querySelectorAll('tbody tr').forEach((tr) => {
    const problemInput = tr.querySelector('.problem-input');
    const dateInput = tr.querySelector('.date input');

    if (problemInput) {
      problemInput.value = '';
    }

    if (dateInput) {
      dateInput.value = '';
    }
  });
}

// Função para adicionar/remover GIF
function atualizarGIF(inputElement) {
  const tdElement = inputElement.parentNode;
  const gifSrc = './SRC/IMG/GIF/SIRENE.gif';

  // Remover GIF existente, se houver
  const existingGif = tdElement.querySelector('.gif-inline');
  if (existingGif) {
    tdElement.removeChild(existingGif);
  }

  // Adicionar GIF se o input não estiver vazio
  if (inputElement.value.trim() !== '') {
    const gifElement = document.createElement('img');
    gifElement.src = gifSrc;
    gifElement.className = 'gif-inline';
    gifElement.style.width = '20px'; // Ajuste o tamanho do GIF conforme necessário
    gifElement.style.height = 'auto';
    gifElement.style.verticalAlign = 'middle'; // Alinhar verticalmente ao meio

    // Inserir o GIF antes do input
    tdElement.insertBefore(gifElement, inputElement);
  }
}

// Adicionar evento de escuta para todos os inputs de problemas
document.querySelectorAll('.problem-input').forEach(input => {
  input.addEventListener('input', async () => {
    atualizarGIF(input);
    await salvarAlteracoes(); // Salvar alterações no Firestore
  });
});

// Adicionar evento de escuta para as datas
document.querySelectorAll('.date input').forEach(input => {
  input.addEventListener('input', async () => {
    await salvarAlteracoes(); // Salvar alterações no Firestore
  });
});

// Carregar estado ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  setEditable(false);
  await carregarItens(); // Carregar itens ao carregar a página
});
