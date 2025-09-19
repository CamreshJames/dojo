import { Node, mergeAttributes } from '@tiptap/core'
import type { NodeViewRendererProps } from '@tiptap/core'

const Video = Node.create({
  name: 'video',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ({ HTMLAttributes }: NodeViewRendererProps) => {
      const video = document.createElement('video')
      video.src = HTMLAttributes.src
      video.controls = HTMLAttributes.controls
      video.style.maxWidth = '100%'
      video.style.height = 'auto'

      return {
        dom: video,
      }
    }
  },
})

export default Video
