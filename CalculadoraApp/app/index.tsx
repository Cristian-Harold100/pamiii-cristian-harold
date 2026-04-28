import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

interface BotaoProps {
  titulo: string;
  corFundo?: string;
  onPress: () => void;
}

export default function Index() {
  const [expressao, setExpressao] = useState<string>('');
  const [resultado, setResultado] = useState<string>('0');
  const [pressionado, setPressionado] = useState<string | null>(null);

  const operadores = ['+', '-', 'x', '÷', '.'];

  const linhasDeBotoes = [
    ['C', '(', ')', '÷'],
    ['7', '8', '9', 'x'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '=']
  ];

  const cores = {
    fundo: '#0f172a',
    display: '#e2e8f0',
    numero: '#1e293b',
    operador: '#38bdf8',
    especial: '#f59e0b',
    limpar: '#ef4444',
    igual: '#22c55e'
  };

  const obterCorFundo = (botao: string): string => {
    if (botao === 'C') return cores.limpar;
    if (botao === '=') return cores.igual;
    if (['÷', 'x', '-', '+'].includes(botao)) return cores.operador;
    if (['(', ')', '⌫'].includes(botao)) return cores.especial;
    return cores.numero;
  };

  const lidarComToque = (valor: string): void => {
    if (valor === 'C') {
      setExpressao('');
      setResultado('0');
      return;
    }

    if (valor === '⌫') {
      const nova = expressao.slice(0, -1);
      setExpressao(nova);
      setResultado(nova || '0');
      return;
    }

    if (valor === '=') {
      try {
        const formatada = expressao.replace(/x/g, '*').replace(/÷/g, '/');
        const res = eval(formatada);
        setResultado(String(res));
        setExpressao(String(res));
      } catch {
        setResultado('Erro');
      }
      return;
    }

    if (operadores.includes(valor)) {
      if (expressao === '' && valor !== '-') return;

      const ultimo = expressao.slice(-1);

      if (operadores.includes(ultimo)) {
        const nova = expressao.slice(0, -1) + valor;
        setExpressao(nova);
        setResultado(nova);
        return;
      }
    }

    const nova = expressao + valor;
    setExpressao(nova);
    setResultado(nova);
  };

  const Botao = ({ titulo, corFundo, onPress }: any) => (
  <TouchableOpacity
    style={[
      styles.botao,
      { backgroundColor: corFundo },
    ]}
    onPress={onPress}
  >
    <Text style={styles.textoBotao}>{titulo}</Text>
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.fundo }]}>
      
      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.expressao}>{expressao}</Text>
        <Text style={[styles.resultado, { color: cores.display }]}>
          {resultado}
        </Text>
      </View>

      {/* Teclado */}
      <View style={styles.tecladoContainer}>
        {linhasDeBotoes.map((linha, i) => (
          <View key={i} style={styles.linha}>
            {linha.map((botao) => (
              <Botao
                key={botao}
                titulo={botao}
                corFundo={obterCorFundo(botao)}
                onPress={() => lidarComToque(botao)}
              />
            ))}
          </View>
        ))}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 20,
  },

  expressao: {
    fontSize: 28,
    color: '#94a3b8',
  },

  resultado: {
    fontSize: 64,
    fontWeight: '300',
  },

  tecladoContainer: {
    paddingHorizontal: 12,
    paddingBottom: 25,
  },

  linha: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },

  botao: {
    width: 75,
    height: 75,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },

  botaoPressionado: {
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },

  textoBotao: {
    fontSize: 28,
    fontWeight: '500',
    color: '#fff',
  },
});