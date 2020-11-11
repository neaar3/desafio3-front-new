import React from "react";
import "./styles.css";


//imagens

import arrow_down from "./assets/arrow_down.svg";
import arrow_up from "./assets/arrow_up.svg";
import arrow_left from "./assets/arrow_left.svg";
import arrow_right from "./assets/arrow_right.svg";
import sort from "./assets/sort.svg";
import pen from "./assets/pen.svg";
import check from "./assets/check.svg";

const colunas = ["posicao", "nome", "pontos", "empates", "vitorias", "derrotas", "golsFeitos", "golsSofridos", "saldoDeGols"];
const legenda = {
  posicao: "Posição",
  nome: "Time",
  pontos: "PTS",
  empates: "E",
  vitorias: "V",
  derrotas: "D",
  golsFeitos: "GF",
  golsSofridos: "GS",
  saldoDeGols: "SG", 
};

function fazerRequisicaoComBody(url, metodo, conteudo, token) {
  return fetch(url, {
      method: metodo,
      headers: {
          "Content-Type": "application/json",
          Authorization: token && `Bearer ${token}`,
      },
      body: JSON.stringify(conteudo),
  });
}
const apiRodada = (rodada, setDataRodada, setRodadaAtual) => {
  fetch(`${process.env.REACT_APP_API_URL}/jogos/${rodada}`)
    .then(res => res.json())
    .then(data => {
        setDataRodada(data.dados)
        setRodadaAtual(data.dados[0].rodada)
    })
    .catch(err => {
      console.error(err);
    })
}

const apiClassificacao = (setDataClassificacao) => {
  fetch(`${process.env.REACT_APP_API_URL}/classificacao`)
    .then(res => res.json())
    .then(data => {
      const newRow = data.dados.map((row, pos) => {
        row.posicao = pos+1
        return row;
      })
      setDataClassificacao(newRow); 
    })
    .catch(err => {
      console.error(err);
    })  
}

const editarJogo = (token, id, golsCasa, golsVisitante) => {
  return fetch(`${process.env.REACT_APP_API_URL}/jogos`, {
    method: 'PUT',
    headers: {
        "Content-Type": "application/json",
        Authorization: token && `Bearer ${token}`,
    },
    body: JSON.stringify({
      "id": id,
      "golsCasa": golsCasa,
      "golsVisitante": golsVisitante,
    })
  })
  .catch(err => {
    console.error(err);
  });
}

function Login(props) {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const { token, setToken } = props;

  return (
    <div className="header-login">
      {token ? (
        <button onClick={() => setToken(null)} className="botao-deslogar"> Deslogar </button>) 
        : 
        (
        <form onSubmit={(element) => {
          element.preventDefault();
            fazerRequisicaoComBody(`${process.env.REACT_APP_API_URL}/auth`, "POST", {
              email,
              senha,
            })
              .then((res) => res.json())
              .then((respostaJson) => {
                const novoToken = respostaJson.dados.token;
                setToken(novoToken);
                setEmail("");
                setSenha("");
              });
          }}
        >
          <label>
            <span className="item-span">Email</span>
            
            <input
              type="email" className="login" value={email} onInput={(element) => setEmail(element.target.value)}/>
          </label>
          <label>
            <span className="item-span">Senha</span>
            <input className="login" type="password" value={senha} onInput={(element) => setSenha(element.target.value)}/>
          </label>

          <button className="botao-login">Logar</button>
        </form>
      )}
    </div>
  );
}

export default function App() {

  //login
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [logado, setLogado] = React.useState(false);
  const [token, setToken] = React.useState(null)

  //edição
  const [edicao, setEdicao] = React.useState(false);
  const [id, setId] = React.useState(null)
  
  //rodada e classificação
  const [dataClassificacao, setDataClassificacao] = React.useState([])
  const [dataRodada, setDataRodada] = React.useState([])
  const [rodadaAtual, setRodadaAtual] = React.useState(null)
  const [rodada, setRodada] = React.useState(1);
  const [golsCasa, setGolsCasa] = React.useState(dataRodada.gols_casa);
  const [golsVisitante, setGolsVisitante] = React.useState(dataRodada.gols_visitante);
  
  //funções para mudar a rodada
  const aumentarRodada = () => {
    rodada < 38 ? setRodada(rodada+1) : setRodada(38);
  }
  const diminuirRodada = () => {
    rodada > 1 ? setRodada(rodada-1) : setRodada(1);
  }

  // ordenar colunas
  const [colunaOrdenada, setColunaOrdenada] = React.useState("posicao");
  const [ordem, setOrdem] = React.useState("descendente");

  // funcoes para organizar colunas
  const organizarColunas = (dados) => {
    const dadosAscendentes = dados.sort((t1, t2) => {
      if (typeof t1[colunaOrdenada] === "number" && typeof t2[colunaOrdenada] === "number") {
        return (
          parseInt(t2[colunaOrdenada], 10) -
          parseInt(t1[colunaOrdenada], 10)
        );
      } else {
        return t1[colunaOrdenada].localeCompare(t2[colunaOrdenada]);
      }
      });
    const dadosOrdenados = ordem === "ascendente" ? dadosAscendentes : dadosAscendentes.reverse(); 
    return dadosOrdenados;
  }
  const tabelaOrdenada = organizarColunas(dataClassificacao)

  // api das rodadas
  React.useEffect(() => {
    apiRodada(rodada, setDataRodada, setRodadaAtual)
  }, [dataRodada])
  

  // api da classificaçao
  React.useEffect(() => {
      apiClassificacao(setDataClassificacao)
  } , [dataClassificacao])
  
  // atualização
  React.useEffect(() => {
    setGolsCasa();
    setGolsVisitante();
    setId(null)
  }, [token])


  return (
    <div className="project">
      <div className="header">
        <span className="brasileirao">Brasileirão</span>
        <Login token={token} setToken={setToken}/>
      </div>

      <div className="container">
        <div className="left">
          <div className="left-header">
            <img className="img-left" src={arrow_left} alt="Anterior" title="Anterior" onClick={()=> diminuirRodada()} />
            {
            rodadaAtual  === null ?
            <div> Carregando...</div> : <span>{rodadaAtual}ª rodada </span>
            }
            <img className="img-right" src={arrow_right} alt="Próxima" title="Próxima" onClick={()=> aumentarRodada()}/>
          </div>
          <table>
            <tbody>
            { dataRodada.map((element) => {
              return (
                
                <tr className="left-item">
                <td className="brasao-casa"><img src={element.brasaoCasa} title={element.time_casa}></img></td>
                <td className="time-casa">{element.time_casa}</td>

                {
                  id !== element.id? 
                  <td className="goal">{element.gols_casa}</td>
                :
                  <input type="number" id="number" value={golsCasa} className="new-input" onChange={event => setGolsCasa(event.target.value)}/>      
                }
                <td className="x">x</td>   
                {
                  id !== element.id?   
                  <td className="goal">{element.gols_visitante}</td>
                :
                             
                  <input type="number" id="number" value={golsVisitante} className="new-input" onChange={event => setGolsVisitante(event.target.value)}/>
                    
                }
                <td className="time-visitante">{element.time_visitante}</td>
                <td className="brasao-visitante"><img src={element.brasaoVisitante}  title={element.time_visitante}></img></td>
                
                {token && (
                  <img src = {id== element.id ? check: pen} className="edicao" alt="pen" title="Editar placar do jogo" onClick={() => {
                    if(id == element.id) {

                    setId(null);
                    
                    editarJogo(token, id, golsCasa, golsVisitante).then(() => {
                      apiClassificacao(setDataClassificacao);
                      apiRodada(rodada, setDataRodada, setRodadaAtual);
                    })
                    }
                    else { 
                      setId(element.id);
                      setGolsCasa(element.gols_casa);
                      setGolsVisitante(element.gols_visitante);              
                    }
                  }}
                  />
                )}            
                </tr>  
              )}
            )}
            </tbody>
          </table>
        </div>

        <div className="right">
          <div>
            <table>
              <tr className="right-header">
              {
            rodadaAtual  === null ?
            <th><div> Carregando...</div></th> : 
            
                colunas.map((coluna) => { return <th>
                  {legenda[coluna]}
                  <img src={colunaOrdenada!==coluna? sort : ordem === "descendente"? arrow_down : arrow_up }  className={legenda[coluna]} onClick={() => {
                    if (colunaOrdenada === coluna) {
                      setOrdem((ordem) => ordem === "descendente"? "ascendente": "descendente");
                    } else {
                      setColunaOrdenada(coluna);
                      setOrdem("descendente");
                  }
                  }} />
                </th>}
                )}
              </tr>    
              {                
                tabelaOrdenada.map((element, i) => {
                  return (
                    
                    <tr>
                      <td className="posicao-classificacao">{element.posicao}</td>
                      <td className="time-nome-classificacao">
                        <div className="time-classificacao">
                          <img className="brasao" src={element.brasao} title={element.nome}/>{element.nome}
                        </div>
                      </td>
                      <td>{element.pontos}</td>
                      <td>{element.empates}</td>
                      <td>{element.vitorias}</td>
                      <td>{element.derrotas}</td>
                      <td>{element.golsFeitos}</td>
                      <td>{element.golsSofridos}</td>
                      <td>{element.golsFeitos - element.golsSofridos}</td>
                    </tr>
                  )}
                )}     
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
