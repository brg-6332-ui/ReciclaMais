import { createSignal, Show } from 'solid-js'
import { toast } from 'solid-toast'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useAuthState } from '~/modules/auth/application/authState'
import { identityAccessFacade } from '~/modules/identity-access/identity-access.facade'
import { modalManager } from '~/modules/modal/core/modalManager'
import { openContentModal } from '~/modules/modal/helpers/modalHelpers'
import type { ModalId } from '~/modules/modal/types/modalTypes'

interface EditProfileModalProps {
  modalId: ModalId
}

function EditProfileModal(props: EditProfileModalProps) {
  const { authState } = useAuthState()
  const state = authState()
  const metadata = state.isAuthenticated
    ? state.session?.user?.user_metadata
    : undefined

  const [name, setName] = createSignal<string>(
    (metadata?.name as string | undefined) ?? '',
  )
  const [avatarUrl, setAvatarUrl] = createSignal<string>(
    (metadata?.avatar_url as string | undefined) ??
      (metadata?.picture as string | undefined) ??
      '',
  )
  const [submitting, setSubmitting] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [imageError, setImageError] = createSignal(false)

  function handleCancel() {
    void modalManager.closeModal(props.modalId)
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setError(null)

    try {
      setSubmitting(true)
      await identityAccessFacade.updateProfile({
        name: name() || null,
        avatarUrl: avatarUrl() || null,
      })

      toast.success('Perfil atualizado com sucesso')
      void modalManager.closeModal(props.modalId)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Falha ao atualizar perfil'
      setError(message)
      toast.error('Falha ao atualizar perfil. Tente novamente mais tarde.')
    } finally {
      setSubmitting(false)
    }
  }

  function getInitials(): string {
    const nameValue = (metadata?.name as string | undefined) ?? ''
    if (nameValue) {
      const parts = nameValue.trim().split(/\s+/)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return parts[0].substring(0, 2).toUpperCase()
    }

    const email = state.isAuthenticated ? (state.session.user.email ?? '') : ''
    if (email) {
      const parts = email.split('@')[0].split(/[._-]/)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return email.substring(0, 2).toUpperCase()
    }

    return '??'
  }

  return (
    <form class="space-y-4 p-4" onSubmit={(e) => void handleSubmit(e)}>
      <div class="flex justify-center">
        <Avatar class="h-20 w-20">
          <Show
            when={avatarUrl() && !imageError()}
            fallback={
              <AvatarFallback class="bg-emerald-600 text-white text-2xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            }
          >
            <AvatarImage
              src={avatarUrl()}
              alt="Avatar preview"
              onLoad={() => setImageError(false)}
              onError={() => setImageError(true)}
            />
          </Show>
        </Avatar>
      </div>
      <div class="space-y-2">
        <Label for="name">Nome</Label>
        <Input
          id="name"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="Como quer ser identificado"
        />
      </div>

      <div class="space-y-2">
        <Label for="avatar">URL do Avatar</Label>
        <Input
          id="avatar"
          value={avatarUrl()}
          onInput={(e) => setAvatarUrl(e.currentTarget.value)}
          placeholder="https://..."
        />
      </div>

      <Show when={error()}>
        <div class="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {error()}
        </div>
      </Show>

      <div class="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="hero" disabled={submitting()}>
          {submitting() ? 'A enviar...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}

export function openEditProfileModal(): void {
  openContentModal((modalId) => <EditProfileModal modalId={modalId} />, {
    title: 'Editar Perfil',
    priority: 'high',
    closeOnOutsideClick: false,
    closeOnEscape: true,
    showCloseButton: true,
  })
}

export default EditProfileModal
