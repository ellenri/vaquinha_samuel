import { useState, useEffect } from 'react';
import './App.css';
import samuelfoto from './assets/JEMA SVA 009-04.jpg';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  const [porcentagem, setPorcentagem] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Dados da vaquinha
  const META = 3000;
  
  // Calcular a porcentagem arrecadada (sem limitar a 100%)
  useEffect(() => {
    const novoPercentual = (valorArrecadado / META) * 100;
    setPorcentagem(novoPercentual);
  }, [valorArrecadado, META]);
  
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
        console.log('Buscando doações da API:', `${API_URL}/api/doacoes?page=${paginaAtual}&limit=${itensPorPagina}`);
        const resposta = await fetch(`${API_URL}/api/doacoes?page=${paginaAtual}&limit=${itensPorPagina}`);
        if (!resposta.ok) {
          throw new Error('Erro ao buscar doações');
        }
        const dados = await resposta.json();
        console.log('Doações recebidas:', dados);
        setDoacoes(dados.doacoes);
        setTotalPaginas(dados.totalPages);
        setCarregando(false);
      } catch (erro) {
        console.error('Erro ao buscar doações:', erro);
        setErro('Não foi possível carregar as doações.');
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
  
  // Cálculos para a paginação
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const doacoesAtuais = doacoes.slice(indexPrimeiroItem, indexUltimoItem);
  
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
    <div className="App">
      <header>
        <h1>Vaquinha Solidária - Elaine e William</h1>
      </header>

      <main>
        {carregando && <div className="loading">Carregando dados...</div>}
        {erro && <div className="error">{erro}</div>}
        
        <div className="container">
          <div className="info-container">
            <div className="image-container">
              <img src={samuelfoto} alt="Samuel" />
            </div>
            <div className="description-container">
              <p>
                Estamos realizando esta vaquinha para ajudar os pais do pequeno Samuel, Elaine e William, que infelizmente faleceu recentemente. O valor arrecadado será destinado a ajudar com os custos do sepultamento e outras despesas neste momento difícil.
              </p>
              <p>
                Qualquer valor é bem-vindo e fará diferença para a família.
              </p>
              <div className="progress-container">
                <div className="progress-info">
                  <span>Meta: {formatarValor(META)}</span>
                  <span>Arrecadado: {formatarValor(valorArrecadado)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${Math.min(porcentagem, 100)}%` }}></div>
                </div>
              </div>
              <button className="contribute-button" onClick={handleContribuir}>
                Quero Contribuir
              </button>
            </div>
          </div>

          <div className="donations-container">
            <h2>Contribuições</h2>
            {carregando ? (
              <p>Carregando doações...</p>
            ) : (
              <>
                <ul className="donations-list">
                  {doacoesAtuais.length > 0 ? (
                    doacoesAtuais.map((doacao, index) => (
                      <li key={index} className="donation-item">
                        <div className="donation-header">
                          <span className="donator-name">{doacao.nome}</span>
                          <span className="donation-date">{formatarData(doacao.data)}</span>
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
                  <div className="pagination">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                      <button
                        key={numero}
                        onClick={() => mudarPagina(numero)}
                        className={numero === paginaAtual ? 'active' : ''}
                      >
                        {numero}
                      </button>
                    ))}
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

      <footer>
        <p>&copy; {new Date().getFullYear()} Vaquinha Solidária - Elaine e William</p>
        <p>Essa é uma página de arrecadação solidária.</p>
      </footer>
    </div>
  );
}

export default App;
