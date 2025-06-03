import { useState, useEffect } from 'react'
import './App.css'
import samuelfoto from './assets/JEMA SVA 009-04.jpg'

function App() {
  const [valorArrecadado, setValorArrecadado] = useState(0)
  const [porcentagem, setPorcentagem] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [valorDoacao, setValorDoacao] = useState('')
  const [nomeDoador, setNomeDoador] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [doacoes, setDoacoes] = useState([])
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina] = useState(5)
  const [pixCopiado, setPixCopiado] = useState(false)
  
  const META = 3000
  
  useEffect(() => {
    // Calcula a porcentagem arrecadada sem limitar a 100%
    const novoPercentual = (valorArrecadado / META) * 100
    setPorcentagem(novoPercentual)
  }, [valorArrecadado, META])
  
  const handleContribuir = () => {
    setShowModal(true)
  }
  
  const formatarData = (data) => {
    const dia = data.getDate().toString().padStart(2, '0')
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const ano = data.getFullYear()
    return `${dia}/${mes}/${ano}`
  }
  
  const handleConfirmarDoacao = () => {
    if (!valorDoacao || isNaN(parseFloat(valorDoacao)) || parseFloat(valorDoacao) <= 0) {
      alert('Por favor, insira um valor válido para doação')
      return
    }
    
    const valor = parseFloat(valorDoacao)
    const novaDoacao = {
      nome: nomeDoador || 'Anônimo',
      valor,
      mensagem: mensagem || '',
      data: formatarData(new Date())
    }
    
    setDoacoes([novaDoacao, ...doacoes])
    setValorArrecadado(valorArrecadado + valor)
    setShowModal(false)
    setValorDoacao('')
    setNomeDoador('')
    setMensagem('')
  }
  
  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  
  // Cálculos para a paginação
  const indexUltimoItem = paginaAtual * itensPorPagina
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina
  const doacoesAtuais = doacoes.slice(indexPrimeiroItem, indexUltimoItem)
  const totalPaginas = Math.ceil(doacoes.length / itensPorPagina)
  
  // Função para mudar de página
  const mudarPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina)
  }
  
  const copiarPix = () => {
    navigator.clipboard.writeText('arianegbg@gmail.com')
      .then(() => {
        setPixCopiado(true)
        setTimeout(() => setPixCopiado(false), 2000)
      })
      .catch(err => {
        console.error('Erro ao copiar: ', err)
      })
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Vaquinha Solidária - Elaine e William</h1>
      </header>
      
      <main className="main-content">
        <div className="top-section">
          <div className="image-container">
            <img 
              src={samuelfoto} 
              alt="Foto do Samuel" 
              className="main-image" 
            />
          </div>
          
          <div className="description">
            <h2>Descrição</h2>
            <p>
              Essa vaquinha foi criada para ajudar os pais (Elaine e William) do pequeno Samuel que infelizmente veio a óbito. 
              O objetivo é arrecadar fundos para cobrir custos com sepultamento e outras despesas neste momento difícil.
            </p>
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-info">
            <h3>Meta: {formatarValor(META)}</h3>
            <h3>Arrecadado: {formatarValor(valorArrecadado)}</h3>
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${Math.min(porcentagem, 100)}%` }}
            ></div>
          </div>
          
          <p className="progress-percentage">{porcentagem.toFixed(1)}% da meta</p>
          
          <button className="contribute-button" onClick={handleContribuir}>
            Contribuir Agora
          </button>
        </div>
        
        <div className="donations-list">
          <h3>Últimas Contribuições</h3>
          {doacoes.length > 0 ? (
            <>
              <ul>
                {doacoesAtuais.map((doacao, index) => (
                  <li key={index} className="donation-item">
                    <div className="donation-header">
                      <span className="donator-name">{doacao.nome}</span>
                      <span className="donation-amount">{formatarValor(doacao.valor)}</span>
                    </div>
                    {doacao.mensagem && <p className="donation-message">"{doacao.mensagem}"</p>}
                    <span className="donation-date">{doacao.data}</span>
                  </li>
                ))}
              </ul>
              
              {totalPaginas > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                    <button 
                      key={numero} 
                      onClick={() => mudarPagina(numero)}
                      className={paginaAtual === numero ? 'active' : ''}
                    >
                      {numero}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="no-donations">Ainda não há contribuições. Seja o primeiro a contribuir!</p>
          )}
        </div>
      </main>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Faça sua contribuição</h3>
            
            <div className="payment-info">
              <h4>Dados para transferência:</h4>
              <div className="payment-details">
                <div className="pix-container">
                  <p><strong>PIX:</strong> arianegbg@gmail.com</p>
                  <button 
                    className={`copy-button ${pixCopiado ? 'copied' : ''}`} 
                    onClick={copiarPix}
                  >
                    {pixCopiado ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p><strong>Banco:</strong> Santander</p>
                <p><strong>Nome:</strong> Ariane Araújo da Silva</p>
              </div>
            </div>
            
            <div className="form-group">
              <label>Valor da doação (R$):</label>
              <input 
                type="number" 
                value={valorDoacao}
                onChange={(e) => setValorDoacao(e.target.value)}
                placeholder="Ex: 50"
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Seu nome (opcional):</label>
              <input 
                type="text" 
                value={nomeDoador}
                onChange={(e) => setNomeDoador(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            
            <div className="form-group">
              <label>Mensagem (opcional):</label>
              <textarea 
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Deixe uma mensagem de apoio..."
              ></textarea>
            </div>
            
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="confirm-button" onClick={handleConfirmarDoacao}>
                Confirmar Doação
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="footer">
        <p>© 2025 Vaquinha Solidária - Elaine e William</p>
        <p>Essa é uma página de arrecadação solidária.</p>
      </footer>
    </div>
  )
}

export default App
