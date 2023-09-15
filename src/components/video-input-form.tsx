import { ChangeEvent, FormEvent, MouseEventHandler, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select"
import { FileVideo, Upload, Wand2, Check, Trash } from "lucide-react"
import { SelectItem, SelectValue } from "@radix-ui/react-select"
import { getFFmpeg } from "@/lib/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { api } from "@/lib/axios"

type Status = 'waiting' | 'fileSelected' | 'converting' | 'uploading' | 'generating' | 'preSuccess' | 'success'

const progressBarValues = {
    'waiting': 0,
    'uploading': 60,
    'generating': 80,
    'preSuccess': 100
}

const progressBarMessages = {
    'converting': 'Convertendo...',
    'uploading': 'Salvando...',
    'generating': 'Transcrevendo...',
    'preSuccess': '',
}

interface VideoInputFormProps {
    onVideoUploaded: (id: string) => void
    onVideoRemoved: () => void
}

export function VideoInputForm(props: VideoInputFormProps) {

    const [status, setStatus] = useState<Status>('waiting')
    const [uploadVideoProgress, setUploadVideoProgress] = useState<number>(0)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const promptInputRef = useRef<HTMLInputElement>(null)

    function removeFileSelected(){
        if (videoInputRef.current) {
            videoInputRef.current.value = ''
        }
        setVideoFile(null)
        setStatus('waiting')
        props.onVideoRemoved()
    }

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const { files } = event.currentTarget

        if (!files) {
            return
        }

        const [ selectedFile ] = files
        setVideoFile(selectedFile)
        setStatus('fileSelected')
        setUploadVideoProgress(0)
    }

    async function convertVideoToAudio(video: File) {
        const now = new Date().getTime()

        const ffmpeg = await getFFmpeg()

        const inputFileName = `input-${now}.mp4`
        const outputFileName = `output-${now}.mp4`

        ffmpeg.writeFile(inputFileName, await fetchFile(video))

        // 100 60
        // 0.47 x

        ffmpeg.on('progress', progress => {
            const progressValue = Math.round(progress.progress * 100)

            if (progressValue > 100) {
                return
            }

            console.log(`Math.round(progress.progress * 100) * 60 / 100`, Math.round(progress.progress * 100) * 60 / 100)

            setUploadVideoProgress(Math.round(progress.progress * 100) * 60 / 100)
        })

        await ffmpeg.exec([
            '-i',
            inputFileName,
            '-map',
            '0:a',
            '-b:a',
            '20k',
            '-acodec',
            'libmp3lame',
            outputFileName
        ])

        const data = await ffmpeg.readFile(outputFileName)

        const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
        const audioFile = new File([audioFileBlob], 'audio.mp3', {
            type: 'audio/mpeg'
        })

        return audioFile
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const prompt = promptInputRef.current?.value

        if (!videoFile) {
            return
        }

        setStatus('converting')

        const audioFile = await convertVideoToAudio(videoFile)

        const data = new FormData()

        data.append('file', audioFile)

        setStatus('uploading')

        const response = await api.post('/videos', data)


        const videoId = response.data.id

        setStatus('generating')

        await api.post(`/videos/${videoId}/transcription`, {
            prompt
        })

        setStatus('preSuccess')
        props.onVideoUploaded(videoId)
    }

    useEffect(() => {
        if (status === 'preSuccess') {
            setTimeout(() => { setStatus('success') }, 200)
        }
    }, [status])

    const previewURL = useMemo(() => {
        if (!videoFile) {
            return null
        }

        return URL.createObjectURL(videoFile)
    }, [videoFile])

    const processHasFinished = status === 'success'


    const progressBarValue = Math.min(status === 'converting' ? uploadVideoProgress : progressBarValues[status], 100)

    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            {videoFile && <div
                    className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
                >
                    <video src={previewURL} autoPlay={true}  loop={true} muted={true} controls={false} className="pointer-events-none inset-0 absolute rounded-md" />
                    <Button variant={'destructive'} className="bottom-2 right-2 absolute" onClick={removeFileSelected}>
                        <Trash className="h-4 w-4"/>
                    </Button>
                </div>
            }

            <label
                htmlFor="video"
                className={` ${videoFile ? 'hidden' : ''} relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5`}
            >
                <FileVideo className="h-4 w-4"/>
                Selecione um vídeo
            </label>

            <input ref={videoInputRef} type="file" accept="video/mp4" id="video" className="sr-only" onChangeCapture={handleFileSelected}/>

            <Separator />

            <div className="space-y-2">
                <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
                <Textarea
                    ref={promptInputRef}
                    disabled={!['waiting', 'fileSelected'].includes(status)}
                    id="transcription_prompt"
                    className="min-h-20 leading-relaxed resize-none"
                    placeholder="Inclua palavras-chave mencionadas no vídeo separadas por (,)"
                />
            </div>

            {status !== 'waiting' && status !== 'fileSelected' && status !== 'success' ?
                <div className="relative w-full h-9 rounded-md flex items-center justify-center">
                    <Progress value={progressBarValue} className="absolute h-9 rounded-md" />
                    <span className="absolute text-sm">{progressBarMessages[status]}</span>
                </div> :
                <Button data-success={status === 'success'} type="submit" className="w-full data-[success=true]:bg-emerald-400" disabled={processHasFinished}>
                    {processHasFinished ? 'Vídeo carregado' : 'Carregar vídeo'}
                    {processHasFinished ? <Check className="h-4 w-4 ml-2"/> : <Upload className="h-4 w-4 ml-2"/>}
                </Button>
            }

        </form>
    )
}