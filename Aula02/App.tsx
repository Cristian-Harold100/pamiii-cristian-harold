import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  SafeAreaView, Image, Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [imagem, setImagem] = useState(null);
  const [musicaInfo, setMusicaInfo] = useState(null);
  const [sound, setSound] = useState(null);
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [tempoAtual, setTempoAtual] = useState(0);
  const [tempoTotal, setTempoTotal] = useState(0);

  // ESCOLHER IMAGEM
  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão', 'Precisamos acessar suas fotos!');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri);
    }
  };

  // ESCOLHER MÚSICA
  const escolherMusica = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (!resultado.canceled) {
        const musica = resultado.assets[0];
        setMusicaInfo({
          nome: musica.name,
          uri: musica.uri,
        });

        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: novoAudio } = await Audio.Sound.createAsync(
          { uri: musica.uri },
          { shouldPlay: false }
        );
        
        setSound(novoAudio);
        
        const status = await novoAudio.getStatusAsync();
        setTempoTotal(status.durationMillis / 1000);

        Alert.alert('Sucesso!', `Música carregada: ${musica.name}`);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível escolher a música');
    }
  };

  // TOCAR/PAUSAR
  const playPause = async () => {
    if (!sound) {
      Alert.alert('Atenção', 'Escolha uma música primeiro!');
      return;
    }

    const status = await sound.getStatusAsync();
    
    if (status.isPlaying) {
      await sound.pauseAsync();
      setTocando(false);
    } else {
      await sound.playAsync();
      setTocando(true);
    }
  };

  // ATUALIZAR PROGRESSO
  useEffect(() => {
    const intervalo = setInterval(async () => {
      if (sound && tocando) {
        const status = await sound.getStatusAsync();
        setProgresso(status.positionMillis / status.durationMillis);
        setTempoAtual(status.positionMillis / 1000);
      }
    }, 500);

    return () => clearInterval(intervalo);
  }, [sound, tocando]);

  // AVANÇAR/VOLTAR
  const seek = async (seconds) => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    const novaPosicao = status.positionMillis + (seconds * 1000);
    await sound.setPositionAsync(novaPosicao);
  };

  const formatarTempo = (segundos) => {
    if (!segundos) return '0:00';
    const mins = Math.floor(segundos / 60);
    const secs = Math.floor(segundos % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* ÁREA DA IMAGEM */}
      <View style={styles.areaImagem}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={styles.imagem} />
        ) : (
          <View style={styles.semImagem}>
            <Ionicons name="images-outline" size={80} color="#ccc" />
            <Text style={styles.textoSemImagem}>Nenhuma imagem</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.botaoFoto} onPress={escolherImagem}>
          <Ionicons name="image" size={24} color="white" />
          <Text style={styles.textoBotao}>Escolher Foto</Text>
        </TouchableOpacity>
      </View>

      {/* ÁREA DO PLAYER */}
      <View style={styles.areaPlayer}>
        <Text style={styles.tituloMusica}>
          {musicaInfo ? musicaInfo.nome : 'Nenhuma música selecionada'}
        </Text>
        
        <TouchableOpacity style={styles.botaoMusica} onPress={escolherMusica}>
          <Ionicons name="musical-notes" size={24} color="#007AFF" />
          <Text style={styles.textoBotaoMusica}>Escolher Música</Text>
        </TouchableOpacity>
        
        {musicaInfo && (
          <>
            <View style={styles.barraProgresso}>
              <View style={[styles.progresso, { width: `${progresso * 100}%` }]} />
            </View>
            
            <View style={styles.tempos}>
              <Text style={styles.tempo}>{formatarTempo(tempoAtual)}</Text>
              <Text style={styles.tempo}>{formatarTempo(tempoTotal)}</Text>
            </View>
            
            <View style={styles.controles}>
              <TouchableOpacity onPress={() => seek(-5)}>
                <Ionicons name="play-back" size={32} color="#007AFF" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={playPause} style={styles.botaoPlay}>
                <Ionicons 
                  name={tocando ? 'pause-circle' : 'play-circle'} 
                  size={64} 
                  color="#007AFF" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => seek(5)}>
                <Ionicons name="play-forward" size={32} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f0f0' 
  },
  areaImagem: { 
    flex: 3, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  imagem: { 
    width: '100%', 
    height: '80%', 
    resizeMode: 'contain', 
    borderRadius: 10 
  },
  semImagem: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  textoSemImagem: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  botaoFoto: { 
    backgroundColor: '#007AFF', 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginTop: 20 
  },
  botaoMusica: { 
    backgroundColor: '#f0f0f0', 
    flexDirection: 'row', 
    padding: 12, 
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginVertical: 15, 
    borderWidth: 1, 
    borderColor: '#007AFF' 
  },
  textoBotao: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  textoBotaoMusica: { 
    color: '#007AFF', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },
  areaPlayer: { 
    flex: 2, 
    backgroundColor: 'white', 
    padding: 20, 
    justifyContent: 'center' 
  },
  tituloMusica: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 10, 
    color: '#333' 
  },
  barraProgresso: { 
    height: 4, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 2, 
    marginBottom: 8 
  },
  progresso: { 
    height: 4, 
    backgroundColor: '#007AFF', 
    borderRadius: 2 
  },
  tempos: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  tempo: {
    fontSize: 12,
    color: '#999',
  },
  controles: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  botaoPlay: {
    marginHorizontal: 20,
  },
});