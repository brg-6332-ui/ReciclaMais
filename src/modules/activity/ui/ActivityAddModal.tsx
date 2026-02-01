import { activityUseCases } from '~/modules/activity/application/usecase/activityUseCases'
import { openContentModal } from '~/modules/modal/helpers/modalHelpers'

function ActivityAddModal() {
  const handleAddActivity = () => {
    activityUseCases.pocAddActivity()
  }
  return (
    <div>
      <h2>Adicionar Atividade de Reciclagem</h2>
      <button onClick={handleAddActivity}>Adicionar</button>
    </div>
  )
}

export function openActivityAddModal() {
  openContentModal(<ActivityAddModal />, {
    title: 'Adicionar Atividade de Reciclagem',
    priority: 'high',
    closeOnEscape: true,
    closeOnOutsideClick: false,
    showCloseButton: true,
  })
}
