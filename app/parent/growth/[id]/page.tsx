'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Heart, Share2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { growthPhotos, courses } from '@/lib/mock-data'

export default function GrowthDetailPage() {
  const params = useParams()
  const router = useRouter()
  const photo = growthPhotos.find(p => p.id === params.id) || growthPhotos[0]
  const course = courses.find(c => c.name === photo.course)

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-black/30">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-black/30">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full bg-black/30">
            <Download className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center min-h-screen">
        <img 
          src={photo.url} 
          alt={photo.description} 
          className="w-full max-h-[80vh] object-contain"
        />
      </div>

      {/* Info */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-start gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: course?.color || '#F87E31' }}
          >
            {photo.course.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{photo.course}</h3>
            <p className="text-sm text-white/70">{photo.description}</p>
          </div>
          <button className="p-2">
            <Heart className="w-6 h-6 text-white" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-white/60">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{photo.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
