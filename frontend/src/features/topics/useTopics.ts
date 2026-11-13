import { useState, type FormEvent } from 'react'
import { initialTopics, type Topic } from '../../demo/data'

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>(initialTopics)
  const [topicSearch, setTopicSearch] = useState('')
  const [directionFilter, setDirectionFilter] = useState('Все направления')
  const [supervisorFilter, setSupervisorFilter] = useState('Все руководители')
  const [topicStatusFilter, setTopicStatusFilter] = useState('Все статусы')
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDirection, setNewDirection] = useState('Веб-разработка')
  const [newSupervisor, setNewSupervisor] = useState('Иван Петров')
  const [newPlaces, setNewPlaces] = useState('2')
  const [formError, setFormError] = useState('')

  const directions = [...new Set(topics.map((topic) => topic.direction))]
  const supervisors = [...new Set(topics.map((topic) => topic.supervisor))]

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      `${topic.title} ${topic.direction} ${topic.supervisor}`
        .toLowerCase()
        .includes(topicSearch.toLowerCase())

    const matchesDirection =
      directionFilter === 'Все направления' ||
      topic.direction === directionFilter

    const matchesSupervisor =
      supervisorFilter === 'Все руководители' ||
      topic.supervisor === supervisorFilter

    const matchesStatus =
      topicStatusFilter === 'Все статусы' ||
      topic.status === topicStatusFilter

    return matchesSearch && matchesDirection && matchesSupervisor && matchesStatus
  })

  function addTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newTitle.trim()) {
      setFormError('Введите название темы.')
      return
    }

    const places = Number(newPlaces)

    if (!Number.isInteger(places) || places < 0 || places > 99) {
      setFormError('Количество мест должно быть целым числом от 0 до 99.')
      return
    }

    const newTopic: Topic = {
      id: Math.max(0, ...topics.map((topic) => topic.id)) + 1,
      title: newTitle.trim(),
      direction: newDirection,
      supervisor: newSupervisor,
      places,
      status: places === 0 ? 'Занята' : 'Открыта',
    }

    setTopics((previous) => [newTopic, ...previous])
    setTopicSearch('')
    setDirectionFilter('Все направления')
    setSupervisorFilter('Все руководители')
    setTopicStatusFilter('Все статусы')
    setNewTitle('')
    setNewPlaces('2')
    setFormError('')
    setShowTopicForm(false)
  }

  return {
    topics,
    setTopics,
    topicSearch,
    setTopicSearch,
    directionFilter,
    setDirectionFilter,
    supervisorFilter,
    setSupervisorFilter,
    topicStatusFilter,
    setTopicStatusFilter,
    showTopicForm,
    setShowTopicForm,
    newTitle,
    setNewTitle,
    newDirection,
    setNewDirection,
    newSupervisor,
    setNewSupervisor,
    newPlaces,
    setNewPlaces,
    formError,
    setFormError,
    directions,
    supervisors,
    filteredTopics,
    addTopic,
  }
}

export type TopicCatalog = ReturnType<typeof useTopics>
