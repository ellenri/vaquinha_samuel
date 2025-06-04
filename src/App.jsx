import { useState, useEffect } from 'react';
import './App.css';
import samuelfoto from './assets/JEMA SVA 009-04.jpg';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Ícone de carro como emoji
const CarIcon = () => (
  <span role="img" aria-label="carro" className="car-icon">🚗</span>
);

function App() {
  // Estados para o formulário de doação
  const [showModal, setShowModal] = useState(false);
  const [nomeDoador, setNomeDoador] = useState('');
  const [valorDoacao, setValorDoacao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [pixCopiado, setPixCopiado] = useState(false);
  
  // Estados para a paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(5);
  
  // Estados para os dados da API
  const [valorArrecadado, setValorArrecadado] = useState(0);
  const [doacoes, setDoacoes] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Dados da vaquinha
  const META = 3000;
  
  // A barra de progresso está usando um valor fixo para demonstração
  
  // Função para formatar a data no padrão dd/mm/yyyy
  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
  };
  
  // Buscar o total arrecadado da API
  useEffect(() => {
    const buscarTotal = async () => {
      try {
        console.log('Buscando total arrecadado da API:', `${API_URL}/api/total`);
        const resposta = await fetch(`${API_URL}/api/total`);
        if (!resposta.ok) {
          throw new Error('Erro ao buscar total arrecadado');
        }
        const dados = await resposta.json();
        console.log('Total arrecadado recebido:', dados);
        setValorArrecadado(dados.total);
      } catch (erro) {
        console.error('Erro ao buscar total:', erro);
        setErro('Não foi possível carregar o total arrecadado.');
      }
    };
    
    buscarTotal();
  }, []);
  
  // Buscar doações da API com paginação
  useEffect(() => {
    const buscarDoacoes = async () => {
      setCarregando(true);
      try {
        console.log(`Buscando doações da API para página ${paginaAtual} com limite ${itensPorPagina}`);
        console.log('URL completa:', `${API_URL}/api/doacoes?page=${paginaAtual}&limit=${itensPorPagina}`);
        
        const resposta = await fetch(`${API_URL}/api/doacoes?page=${paginaAtual}&limit=${itensPorPagina}`);
        if (!resposta.ok) {
          throw new Error(`Erro ao buscar doações: ${resposta.status} ${resposta.statusText}`);
        }
        
        const dados = await resposta.json();
        console.log('Doações recebidas:', dados);
        console.log(`Total de doações na página ${paginaAtual}:`, dados.doacoes ? dados.doacoes.length : 0);
        console.log('Total de páginas:', dados.totalPages);
        console.log('Total de doações no banco:', dados.total);
        
        if (dados.doacoes) {
          setDoacoes(dados.doacoes);
          setTotalPaginas(dados.totalPages);
        } else {
          console.error('Dados de doações inválidos:', dados);
          setDoacoes([]);
        }
        
        setCarregando(false);
      } catch (erro) {
        console.error('Erro ao buscar doações:', erro);
        setErro('Não foi possível carregar as doações.');
        setCarregando(false);
      }
    };
    
    buscarDoacoes();
  }, [paginaAtual, itensPorPagina]);

  // Abrir o modal de contribuição
  const handleContribuir = () => {
    setShowModal(true);
  };
  
  // Confirmar a doação
  const handleConfirmarDoacao = async () => {
    if (!valorDoacao || isNaN(parseFloat(valorDoacao)) || parseFloat(valorDoacao) <= 0) {
      alert('Por favor, insira um valor válido para doação');
      return;
    }
    
    const valor = parseFloat(valorDoacao);
    const novaDoacao = {
      nome: nomeDoador || 'Anônimo',
      valor: valor,
      mensagem: mensagem || ''
    };
    
    console.log('Enviando nova doação:', novaDoacao);
    
    try {
      const resposta = await fetch(`${API_URL}/api/doacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaDoacao)
      });
      
      if (!resposta.ok) {
        throw new Error('Erro ao enviar doação');
      }
      
      const doacaoConfirmada = await resposta.json();
      console.log('Doação confirmada:', doacaoConfirmada);
      
      // Atualizar os dados após a doação bem-sucedida
      setValorArrecadado(valorArrecadado + valor);
      setShowModal(false);
      setValorDoacao('');
      setNomeDoador('');
      setMensagem('');
      
      // Recarregar a lista de doações
      console.log('Recarregando lista de doações após nova doação');
      const respostaDoacoes = await fetch(`${API_URL}/api/doacoes?page=1&limit=${itensPorPagina}`);
      if (respostaDoacoes.ok) {
        const dadosDoacoes = await respostaDoacoes.json();
        console.log('Novas doações carregadas:', dadosDoacoes);
        setDoacoes(dadosDoacoes.doacoes);
        setTotalPaginas(dadosDoacoes.totalPages);
        setPaginaAtual(1); // Voltar para a primeira página
      }
    } catch (erro) {
      console.error('Erro ao enviar doação:', erro);
      setErro('Não foi possível enviar a doação.');
      alert('Erro ao enviar doação. Por favor, tente novamente.');
    }
  };
  
  // Formatar valor para o formato de moeda brasileira
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };
  
  // Função para mudar de página
  const mudarPagina = (numeroPagina) => {
    setCarregando(true); // Indica que está carregando durante a mudança de página
    setPaginaAtual(numeroPagina);
    // O useEffect que busca as doações será acionado quando paginaAtual mudar
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
    <div className="App">
      <header className="header">
        <h1>Vaquinha Solidária - Elaine e William</h1>
      </header>

      <main className="main-content">
        {carregando && <div className="loading">Carregando dados...</div>}
        {erro && <div className="error">{erro}</div>}
        
        <div className="container">
          <div className="description-image-container">
            <div className="image-wrapper">
              <img src={samuelfoto} alt="Samuel" className="profile-image" />
            </div>
            
            <div className="description-card">
              <h3>Vaquinha Solidária</h3>
              <p>
                Estamos realizando esta vaquinha para ajudar os pais do pequeno Samuel, Elaine e William, que infelizmente faleceu recentemente. O valor arrecadado será destinado a ajudar com os custos do sepultamento e outras despesas neste momento difícil.
              </p>
              <p>
                Qualquer valor é bem-vindo e fará diferença para a família.
              </p>
            </div>
          </div>
          
          <div className="card donation-card" style={{
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderRadius: '12px',
            padding: '28px',
            background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)'
          }}>
            <div className="donation-info">
              <div className="donation-header">
                <h2 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>Arrecadado</h2>
              </div>
              
              <div className="amount-display" style={{ marginBottom: '15px' }}>
                <span className="amount" style={{ fontSize: '2.2rem', fontWeight: '700' }}>R$ {valorArrecadado.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <p className="goal-text" style={{ fontSize: '1.2rem', marginBottom: '18px' }}>Meta: R$ {META.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace('.', ',')}</p>
              
              {/* Barra de progresso baseada no valor arrecadado - Aumentada */}
              <div style={{ position: 'relative', marginBottom: '30px', marginTop: '15px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '16px', 
                  backgroundColor: '#e6e6e6', 
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    width: `${(valorArrecadado / META) * 100}%`, 
                    height: '100%', 
                    backgroundColor: valorArrecadado >= META ? '#2e7d32' : '#4caf50',
                    borderRadius: '10px',
                    transition: 'width 0.5s ease-in-out, background-color 0.5s ease-in-out',
                    boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)'
                  }}></div>
                </div>
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '22px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: valorArrecadado >= META ? '#2e7d32' : '#555'
                }}>
                  {Math.round((valorArrecadado / META) * 100)}%
                  {valorArrecadado >= META && <span role="img" aria-label="celebração" style={{ marginLeft: '5px' }}>🎉</span>}
                </div>
              </div>
              
              <div className="supporters-info" style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Apoiadores: <span style={{ fontWeight: '600' }}>{doacoes.length}</span></p>
              </div>
              
              <button 
                className="help-button" 
                onClick={handleContribuir}
                style={{
                  padding: '14px 28px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
              >
                Quero Ajudar
              </button>
            </div>
          </div>

          <div className="donations-container">
            <h2>Contribuições</h2>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>
              Página {paginaAtual} de {totalPaginas} • Total: {doacoes.length} doações nesta página
            </div>
            {carregando ? (
              <p>Carregando doações...</p>
            ) : (
              <>
                <ul className="donations-list">
                  {doacoes.length > 0 ? (
                    doacoes.map((doacao, index) => (
                      <li key={index} className="donation-item">
                        <div className="donation-header">
                          <span className="donator-name">{doacao.nome}</span>
                          <span className="donation-date">{formatarData(doacao.data_criacao)}</span>
                        </div>
                        <div className="donation-amount">{formatarValor(doacao.valor)}</div>
                        {doacao.mensagem && <div className="donation-message">{doacao.mensagem}</div>}
                      </li>
                    ))
                  ) : (
                    <li className="no-donations">Nenhuma doação registrada ainda.</li>
                  )}
                </ul>

                {totalPaginas > 1 && (
                  <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {/* Botão anterior */}
                    <button 
                      onClick={() => paginaAtual > 1 && mudarPagina(paginaAtual - 1)}
                      disabled={paginaAtual === 1 || carregando}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: paginaAtual === 1 ? '#f5f5f5' : '#fff',
                        cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                        opacity: paginaAtual === 1 ? 0.7 : 1
                      }}
                    >
                      &laquo;
                    </button>
                    
                    {/* Números das páginas */}
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                      <button
                        key={numero}
                        onClick={() => numero !== paginaAtual && mudarPagina(numero)}
                        disabled={carregando}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          backgroundColor: numero === paginaAtual ? '#4caf50' : '#fff',
                          color: numero === paginaAtual ? '#fff' : '#333',
                          fontWeight: numero === paginaAtual ? 'bold' : 'normal',
                          cursor: numero === paginaAtual ? 'default' : 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {numero}
                      </button>
                    ))}
                    
                    {/* Botão próximo */}
                    <button 
                      onClick={() => paginaAtual < totalPaginas && mudarPagina(paginaAtual + 1)}
                      disabled={paginaAtual === totalPaginas || carregando}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: paginaAtual === totalPaginas ? '#f5f5f5' : '#fff',
                        cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                        opacity: paginaAtual === totalPaginas ? 0.7 : 1
                      }}
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Contribuir</h2>
              <p>Para contribuir com a vaquinha, faça uma transferência via PIX:</p>
              
              <div className="pix-info">
                <div className="pix-item">
                  <span className="pix-label">Chave PIX:</span>
                  <div className="pix-value-container">
                    <span className="pix-value">arianegbg@gmail.com</span>
                    <button 
                      className={`copy-button ${pixCopiado ? 'copied' : ''}`} 
                      onClick={copiarPix}
                    >
                      {pixCopiado ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
                <div className="pix-item">
                  <span className="pix-label">Banco:</span>
                  <span className="pix-value">Santander</span>
                </div>
                <div className="pix-item">
                  <span className="pix-label">Nome:</span>
                  <span className="pix-value">Ariane Araújo da Silva</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nome">Seu Nome (opcional):</label>
                <input
                  type="text"
                  id="nome"
                  value={nomeDoador}
                  onChange={(e) => setNomeDoador(e.target.value)}
                  placeholder="Anônimo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="valor">Valor Doado (R$):</label>
                <input
                  type="number"
                  id="valor"
                  value={valorDoacao}
                  onChange={(e) => setValorDoacao(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mensagem">Mensagem (opcional):</label>
                <textarea
                  id="mensagem"
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
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Vaquinha Solidária - Elaine e William</p>
        <p>Essa é uma página de arrecadação solidária.</p>
      </footer>
    </div>
  );
}

export default App;
