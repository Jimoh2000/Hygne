'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { EyeOff, Eye, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'

const schema = z.object({
  body:        z.string().min(2, 'Reply is too short').max(500),
  isAnonymous: z.boolean(),
})
type FormData = z.infer<typeof schema>

export function ReplyForm({ postId }: { postId: Id<'communityPosts'> }) {
  const createReply = useMutation(api.community.createReply)
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isAnonymous: true },
  })
  const isAnonymous = watch('isAnonymous')

  async function onSubmit(data: FormData) {
    await createReply({ postId, body: data.body, isAnonymous: data.isAnonymous })
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <h3 className="font-serif text-lg text-gray-900">Add a reply</h3>
      <button type="button" onClick={() => setValue('isAnonymous', !isAnonymous)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${isAnonymous ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        {isAnonymous ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {isAnonymous ? 'Anonymous reply' : 'Reply as myself'}
      </button>
      <Textarea placeholder="Share your experience or advice…" rows={3} error={errors.body?.message} {...register('body')} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={isSubmitting} rightIcon={<Send className="w-3.5 h-3.5" />}>Post reply</Button>
      </div>
    </form>
  )
}
