'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, EyeOff, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { FormField } from '@/components/ui/input'

const CATEGORIES = ['Body Care','Dental','Skincare','Hair Care','Feminine',"Men's Care",'General']
const schema = z.object({
  body:        z.string().min(10, 'Please write at least 10 characters').max(1000),
  category:    z.string().optional(),
  isAnonymous: z.boolean(),
})
type FormData = z.infer<typeof schema>

export function NewPostButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} leftIcon={<Plus className="w-4 h-4" />} size="sm">Ask a question</Button>
      {open && <NewPostModal onClose={() => setOpen(false)} />}
    </>
  )
}

function NewPostModal({ onClose }: { onClose: () => void }) {
  const router     = useRouter()
  const createPost = useMutation(api.community.createPost)
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isAnonymous: true },
  })
  const isAnonymous = watch('isAnonymous')

  async function onSubmit(data: FormData) {
    await createPost({ body: data.body, isAnonymous: data.isAnonymous, category: data.category || undefined })
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-100">
          <h2 className="font-serif text-xl text-gray-900">Ask a question</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div onClick={() => setValue('isAnonymous', !isAnonymous)}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isAnonymous ? 'bg-brand-50 border-brand-200' : 'bg-gray-50 border-gray-200'}`}>
            {isAnonymous ? <EyeOff className="w-4 h-4 text-brand-500" /> : <Eye className="w-4 h-4 text-gray-400" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{isAnonymous ? 'Posting anonymously' : 'Posting as yourself'}</p>
              <p className="text-xs text-gray-400">{isAnonymous ? 'Your name will not be shown.' : 'Your display name will be visible.'}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 transition-colors ${isAnonymous ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`} />
          </div>
          <FormField label="Category (optional)">
            <select {...register('category')} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select a category…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Your question" error={errors.body?.message} required>
            <Textarea placeholder="What's on your mind? Be as specific as you like…" rows={5} error={errors.body?.message} {...register('body')} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>Post question</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
