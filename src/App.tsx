import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select"
import { Github, FileVideo, Upload, Wand2 } from "lucide-react"
import { SelectItem, SelectValue } from "@radix-ui/react-select"

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-3 flex items-center justify-between border-b">

        <h1 className="text-xl">
          upload
          <span className="text-primary" style={{
            fontSize: '1.75rem'
          }}>.
          </span>
          ai
        </h1>

        <Separator orientation="vertical" className="h-6"/>

        <a href="https://github.com/luishjacinto" target="_blank">
          <Button variant='outline'>
            <Github className="w-4 h-4 mr-2"/> luishjacinto
          </Button>
        </a>

      </div>
      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4">

          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              className="resize-none p-4 leading-relaxed"
              placeholder="Inclua o prompt para a IA..."
            />
            <Textarea
              className="resize-none p-4 leading-relaxed"
              placeholder="Resultado gerado pela IA..."
              readOnly
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável <code className="text-primary">{'{transcription}'}</code> no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
          </p>
  
        </div>
        <aside className="w-80 space-y-6">
          <form className="space-y-6">

            <label
              htmlFor="video"
              className="border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
            >
              <FileVideo className="h-4 w-4"/>
              Selecione um vídeo
            </label>

            <input type="file" accept="video/mp4" id="video" className="sr-only"/>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
              <Textarea
                id="transcription_prompt"
                className="min-h-20 leading-relaxed resize-none"
                placeholder="Inclua palavras-chave mencionadas no vídeo separadas por (,)"
              />
            </div>

            <Button type="submit" className="w-full">
              Carregar vídeo
              <Upload className="h-4 w-4 ml-2"/>
            </Button>

          </form>

          <Separator />

          <form className="space-y-6">

            <div className="space-y-2">
              <Label>Prompt</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um prompt..."/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Título do YoutTube</SelectItem>
                  <SelectItem value="description">Descrição do YoutTube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select defaultValue="gpt3.5">
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className="block text-sm text-muted-foreground italic">Você poderá customizar essa opção em breve.</span>
            </div>

            <Separator/>

            <div className="space-y-4">
              <Label htmlFor="temperature">Temperatura</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
              />
              <span className="block text-sm text-muted-foreground italic leading-relaxed">Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros.</span>
            </div>

            <Separator/>

            <Button type="submit" className="w-full">
              Executar
              <Wand2 className="h-4 w-4 ml-2"/>
            </Button>

          </form>
        </aside>
      </main>
    </div>
  )
}

export { App }
