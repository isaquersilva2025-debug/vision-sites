let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound() {
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        let osc = audioCtx.createOscillator();
        let gainNode = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.08);

        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
        // Ignora restrições automáticas de áudio do navegador
    }
}

// Gerador dinâmico de partículas e névoa flutuando na tela
function createFogParticles() {
    const container = document.getElementById('fogContainer');
    if (!container) return;
    
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'fog-particle';
        
        const size = Math.random() * 140 + 50;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        
        const duration = Math.random() * 14 + 8;
        const delay = Math.random() * 10;
        p.style.animationDuration = `${duration}s`;
        p.style.animationDelay = `${delay}s`;
        
        container.appendChild(p);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createFogParticles();
    updateSummary();
});

let planoAtualValor = 1000;
let planoAtualNome = 'Site Premium';
let paginasAtualNome = '1 Página';

function selectPlan(element, valor, nome) {
    playSound();
    document.querySelectorAll('input[name="plano"]').forEach(input => {
        input.closest('.select-card').classList.remove('active');
    });
    element.classList.add('active');
    element.querySelector('input').checked = true;

    planoAtualValor = valor;
    planoAtualNome = nome;
    updateSummary();
}

function selectPages(element, nome) {
    playSound();
    document.querySelectorAll('input[name="paginas"]').forEach(input => {
        input.closest('.select-card').classList.remove('active');
    });
    element.classList.add('active');
    element.querySelector('input').checked = true;

    paginasAtualNome = nome;
    updateSummary();
}

// Controle de destaque visual nos checkboxes
document.querySelectorAll('.checkbox-item input').forEach(input => {
    input.addEventListener('change', function() {
        if(this.checked) {
            this.closest('.checkbox-item').classList.add('active');
        } else {
            this.closest('.checkbox-item').classList.remove('active');
        }
    });
});

function updateSummary() {
    document.getElementById('sum-plano').innerText = `${planoAtualNome} - R$ ${planoAtualValor.toLocaleString('pt-BR')}`;
    
    let tipo = document.getElementById('tipo-site').value;
    document.getElementById('sum-tipo').innerText = `${tipo} (${paginasAtualNome})`;

    let extrasList = document.getElementById('sum-extras');
    extrasList.innerHTML = '';
    
    let totalExtras = 0;
    let extrasCount = 0;

    document.querySelectorAll('.extra-item:checked').forEach(item => {
        let p = parseInt(item.getAttribute('data-price')) || 0;
        totalExtras += p;
        extrasCount++;

        let li = document.createElement('li');
        li.innerText = `${item.getAttribute('data-name')} (+R$ ${p})`;
        extrasList.appendChild(li);
    });

    if(extrasCount === 0) {
        let li = document.createElement('li');
        li.innerText = 'Nenhum extra selecionado';
        extrasList.appendChild(li);
    }

    let valorTotal = planoAtualValor + totalExtras;
    document.getElementById('sum-total').innerText = 'R$ ' + valorTotal.toLocaleString('pt-BR');
}

function enviarWhatsApp() {
    let nome = document.getElementById('cli-nome').value.trim();
    let whats = document.getElementById('cli-whats').value.trim();
    let email = document.getElementById('cli-email').value.trim();
    let empresa = document.getElementById('cli-empresa').value.trim();
    let cidade = document.getElementById('cli-cidade').value.trim();
    let tipo = document.getElementById('tipo-site').value;
    let estilo = document.getElementById('estilo-site').value;
    let descricao = document.getElementById('cli-descricao').value.trim();

    if(!nome || !whats) {
        alert('Por favor, preencha o seu Nome e o seu WhatsApp antes de enviar o orçamento.');
        document.getElementById('cli-nome').focus();
        return;
    }

    let funcoes = [];
    document.querySelectorAll('.feat-item:checked').forEach(el => {
        funcoes.push('- ' + el.parentElement.innerText.trim());
    });

    let possui = [];
    document.querySelectorAll('.possui-item:checked').forEach(el => {
        possui.push(el.parentElement.innerText.trim());
    });

    let extras = [];
    let totalExtras = 0;
    document.querySelectorAll('.extra-item:checked').forEach(el => {
        let p = parseInt(el.getAttribute('data-price')) || 0;
        totalExtras += p;
        extras.push(`- ${el.getAttribute('data-name')} (+R$${p})`);
    });

    let valorTotalOriginal = planoAtualValor + totalExtras;

    let mensagem = `Olá! Gostaria de solicitar um orçamento.\n\n` +
        `👤 *Nome:* ${nome}\n` +
        `📱 *WhatsApp:* ${whats}\n` +
        (email ? `📧 *E-mail:* ${email}\n` : ``) +
        (empresa ? `🏢 *Empresa:* ${empresa}\n` : ``) +
        (cidade ? `📍 *Cidade:* ${cidade}\n` : ``) +
        `\n📦 *Plano:* \n${planoAtualNome} - R$ ${planoAtualValor.toLocaleString('pt-BR')}\n` +
        `\n🌐 *Tipo:* \n${tipo}\n` +
        `\n📄 *Páginas:* \n${paginasAtualNome}\n` +
        (funcoes.length > 0 ? `\n⚙️ *Funcionalidades:* \n` + funcoes.join('\n') + `\n` : ``) +
        `\n🎨 *Estilo:* \n${estilo}\n` +
        (possui.length > 0 ? `\n📁 *Já possui:* \n` + possui.join(', ') + `\n` : ``) +
        (extras.length > 0 ? `\n⭐ *Extras:* \n` + extras.join('\n') + `\n` : ``) +
        `\n💰 *Valor Estimado:* \nR$ ${valorTotalOriginal.toLocaleString('pt-BR')}\n` +
        (descricao ? `\n📝 *Descrição:* \n${descricao}\n` : ``);

    let numeroDestino = '5511957094389';
    let urlWpp = `https://api.whatsapp.com/send?phone=${numeroDestino}&text=${encodeURIComponent(mensagem)}`;

    window.open(urlWpp, '_blank');
}
