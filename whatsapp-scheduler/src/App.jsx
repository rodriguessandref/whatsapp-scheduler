import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Clock, MessageSquare, Users, Send, Trash2, Edit, Plus } from 'lucide-react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    target: 'meninos',
    date: '',
    time: '',
    recurring: 'none'
  })
  const [editingId, setEditingId] = useState(null)

  // Carregar mensagens salvas
  useEffect(() => {
    const savedMessages = localStorage.getItem('whatsapp-messages')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  // Salvar mensagens
  useEffect(() => {
    localStorage.setItem('whatsapp-messages', JSON.stringify(messages))
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingId) {
      setMessages(messages.map(msg => 
        msg.id === editingId ? { ...newMessage, id: editingId } : msg
      ))
      setEditingId(null)
    } else {
      const message = {
        ...newMessage,
        id: Date.now(),
        status: 'agendada',
        createdAt: new Date().toISOString()
      }
      setMessages([...messages, message])
    }
    
    setNewMessage({
      title: '',
      content: '',
      target: 'meninos',
      date: '',
      time: '',
      recurring: 'none'
    })
  }

  const handleEdit = (message) => {
    setNewMessage(message)
    setEditingId(message.id)
  }

  const handleDelete = (id) => {
    setMessages(messages.filter(msg => msg.id !== id))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendada': return 'bg-blue-500'
      case 'enviada': return 'bg-green-500'
      case 'erro': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTargetIcon = (target) => {
    return target === 'meninos' ? '👨' : target === 'meninas' ? '👩' : '👥'
  }

  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <MessageSquare className="text-green-600" size={40} />
            WhatsApp Scheduler
          </h1>
          <p className="text-gray-600 text-lg">Sistema de Agendamento para Igreja</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Nova Mensagem */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size={20} />
                {editingId ? 'Editar Mensagem' : 'Nova Mensagem'}
              </CardTitle>
              <CardDescription>
                Crie e agende mensagens para os jovens da igreja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Mensagem</Label>
                  <Input
                    id="title"
                    value={newMessage.title}
                    onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                    placeholder="Ex: Lembrete do Culto"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo da Mensagem</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    placeholder="Digite sua mensagem aqui..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="target">Destinatários</Label>
                  <Select value={newMessage.target} onValueChange={(value) => setNewMessage({...newMessage, target: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meninos">👨 Meninos (59 contatos)</SelectItem>
                      <SelectItem value="meninas">👩 Meninas (65 contatos)</SelectItem>
                      <SelectItem value="todos">👥 Todos (124 contatos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newMessage.date}
                      onChange={(e) => setNewMessage({...newMessage, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newMessage.time}
                      onChange={(e) => setNewMessage({...newMessage, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="recurring">Repetição</Label>
                  <Select value={newMessage.recurring} onValueChange={(value) => setNewMessage({...newMessage, recurring: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não repetir</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="monthly">Mensalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  {editingId ? 'Atualizar Mensagem' : 'Agendar Mensagem'}
                </Button>
                
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setEditingId(null)
                      setNewMessage({
                        title: '',
                        content: '',
                        target: 'meninos',
                        date: '',
                        time: '',
                        recurring: 'none'
                      })
                    }}
                  >
                    Cancelar Edição
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Lista de Mensagens Agendadas */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Mensagens Agendadas
              </CardTitle>
              <CardDescription>
                {messages.length} mensagem(s) agendada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem agendada ainda</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTargetIcon(message.target)}</span>
                          <h3 className="font-semibold text-gray-800">{message.title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(message)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(message.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {message.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDateTime(message.date, message.time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {message.target === 'meninos' ? '59' : message.target === 'meninas' ? '65' : '124'} contatos
                          </span>
                        </div>
                        <Badge className={`${getStatusColor(message.status)} text-white`}>
                          {message.status}
                        </Badge>
                      </div>
                      
                      {message.recurring !== 'none' && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Repete: {message.recurring === 'daily' ? 'Diariamente' : 
                                    message.recurring === 'weekly' ? 'Semanalmente' : 'Mensalmente'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {messages.filter(m => m.status === 'agendada').length}
              </div>
              <p className="text-gray-600">Mensagens Agendadas</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {messages.filter(m => m.status === 'enviada').length}
              </div>
              <p className="text-gray-600">Mensagens Enviadas</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">124</div>
              <p className="text-gray-600">Total de Contatos</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Sistema de Agendamento WhatsApp - Igreja</p>
          <p>Desenvolvido para facilitar a comunicação com os jovens</p>
        </div>
      </div>
    </div>
  )
}

export default App
