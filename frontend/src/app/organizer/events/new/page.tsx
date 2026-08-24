"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  Search,
  Check,
  Music,
  Film,
  AlertCircle,
} from "lucide-react";
import { eventsApi, catalogApi } from "@/services/api";
import type { CatalogItem, EventType, EventStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

export default function NewEventPage() {
  const router = useRouter();

  // Estados do Formulário Principal
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("SHOW");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<EventStatus>("PUBLISHED");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados do Assistente de Catálogo
  const [catalogQuery, setCatalogQuery] = useState("");
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [catalogResults, setCatalogResults] = useState<CatalogItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogQuery.trim()) return;

    setIsSearchingCatalog(true);
    setHasSearched(true);
    try {
      const response = await catalogApi.search(catalogQuery.trim(), "ALL");
      setCatalogResults(response.data);
    } catch (error) {
      console.error("Erro na busca do catálogo:", error);
      setCatalogResults([]);
    } finally {
      setIsSearchingCatalog(false);
    }
  };

  const handleApplyCatalogItem = (item: CatalogItem) => {
    setTitle(item.title);
    setDescription(item.description);
    setType(item.type);
    if (item.category) setCategory(item.category);
    if (item.imageUrl) setImageUrl(item.imageUrl);
    if (item.location) setLocation(item.location);
    if (item.date) {
      const parsedDate = new Date(item.date);
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate.toISOString().slice(0, 16));
      }
    }
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validações explícitas com feedback imediato
    if (!title.trim()) {
      setErrorMessage("Por favor, informe o título do evento.");
      return;
    }
    if (!date) {
      setErrorMessage("Por favor, selecione a data e hora do evento.");
      return;
    }
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      setErrorMessage("A data selecionada é inválida.");
      return;
    }
    if (eventDate <= new Date()) {
      setErrorMessage("A data do evento deve ser no futuro.");
      return;
    }
    if (!location.trim()) {
      setErrorMessage("Por favor, informe o local do evento.");
      return;
    }
    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      setErrorMessage("A capacidade de ingressos deve ser um número maior que zero.");
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage("O preço do ingresso deve ser um valor válido.");
      return;
    }

    setIsLoading(true);

    try {
      await eventsApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        category: category.trim() || undefined,
        date: eventDate.toISOString(),
        location: location.trim(),
        capacity: capNum,
        price: priceNum,
        imageUrl: imageUrl.trim() || undefined,
        status,
      });

      router.push("/organizer/events");
    } catch (err) {
      console.error("Erro ao criar evento:", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro ao criar evento. Verifique os campos e tente novamente.");
      }
      window.scrollTo({ top: 350, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Topo / Voltar */}
        <div className="space-y-2">
          <Link
            href="/organizer/events"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Painel de Eventos
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Criar Novo Evento</h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Cadastre os dados manualmente ou use nosso assistente para importar informações de filmes e shows.
          </p>
        </div>

        {/* Assistente de Catálogo Inteligente (TMDb / Ticketmaster) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Assistente de Catálogo Externo (TMDb & Ticketmaster)</span>
          </div>
          <p className="text-xs text-zinc-400">
            Digite o nome de uma banda, festival ou filme (ex: <em>Metallica, Duna, Coldplay, Batman</em>) para auto-preencher imagem, sinopse e categoria.
          </p>

          <form onSubmit={handleSearchCatalog} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ex: Metallica, Duna, Coldplay, Batman..."
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="bg-zinc-950"
              />
            </div>
            <Button type="submit" variant="secondary" size="md" isLoading={isSearchingCatalog}>
              Buscar no Catálogo
            </Button>
          </form>

          {/* Resultados da Busca Externa */}
          {catalogResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
              {catalogResults.slice(0, 4).map((item) => (
                <div
                  key={item.externalId}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex gap-3 items-start hover:border-zinc-700 transition-colors"
                >
                  {item.imageUrl && (
                    <div className="relative w-14 h-20 bg-zinc-900 rounded-md overflow-hidden shrink-0 border border-zinc-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={item.type === "SHOW" ? "purple" : "default"} size="sm">
                        {item.type === "SHOW" ? "Show" : "Cinema"}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.source}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{item.description}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 text-[11px] h-7 px-2"
                      onClick={() => handleApplyCatalogItem(item)}
                      leftIcon={<Check className="w-3 h-3" />}
                    >
                      Preencher Formulário
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasSearched && !isSearchingCatalog && catalogResults.length === 0 && (
            <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">
              Nenhum resultado externo encontrado para <strong>&ldquo;{catalogQuery}&rdquo;</strong>. Você pode preencher os campos abaixo manualmente.
            </p>
          )}
        </div>

        {/* Formulário Principal de Cadastro */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zinc-950 border border-rose-900/60 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Tipo de Evento (Show ou Filme) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">Tipo de Evento *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("SHOW")}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold",
                    type === "SHOW"
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <Music className="w-4 h-4" />
                  Show / Festival de Música
                </button>

                <button
                  type="button"
                  onClick={() => setType("MOVIE")}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold",
                    type === "MOVIE"
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <Film className="w-4 h-4" />
                  Filme / Sessão de Cinema
                </button>
              </div>
            </div>

            {/* Título */}
            <Input
              label="Título do Evento *"
              placeholder="Ex: Coldplay - Music of the Spheres Tour"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Descrição */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Descrição / Sinopse</label>
              <textarea
                rows={4}
                placeholder="Descreva detalhes sobre as atrações, horários de abertura e classificação etária..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-sm bg-zinc-950 text-zinc-100 placeholder-zinc-500 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Categoria e Imagem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Categoria / Gênero"
                placeholder="Ex: Rock Alternativo, Ficção Científica, MPB..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <Input
                label="URL da Imagem de Capa"
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                leftIcon={<ImageIcon className="w-4 h-4" />}
              />
            </div>

            {/* Data e Local */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Data e Hora do Evento *"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Input
                label="Local do Evento *"
                placeholder="Ex: Estádio Morumbi, São Paulo - SP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>

            {/* Capacidade e Preço */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Capacidade Total de Ingressos *"
                type="number"
                min="1"
                placeholder="Ex: 500"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                leftIcon={<Users className="w-4 h-4" />}
              />

              <Input
                label="Preço por Ingresso (R$) *"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 150.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                leftIcon={<DollarSign className="w-4 h-4" />}
              />
            </div>

            {/* Status de Publicação */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-zinc-300">Status de Publicação</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("PUBLISHED")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold border transition-all",
                    status === "PUBLISHED"
                      ? "bg-zinc-800 border-zinc-600 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  )}
                >
                  ✓ Publicar Imediatamente (Visível na Vitrine)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold border transition-all",
                    status === "DRAFT"
                      ? "bg-zinc-800 border-zinc-600 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  )}
                >
                  Salvar como Rascunho
                </button>
              </div>
            </div>
          </div>

          {/* Ações do Formulário */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-800">
            <Link href="/organizer/events">
              <Button type="button" variant="outline" size="md">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Salvar e Criar Evento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
