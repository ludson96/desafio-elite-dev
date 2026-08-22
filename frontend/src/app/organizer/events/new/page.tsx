"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Sparkles,
  Search,
  ArrowLeft,
  DollarSign,
  Users,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Film,
  Music,
  Plus,
} from "lucide-react";
import { catalogApi, eventsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { CatalogItem, EventType, EventStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

export default function NewEventPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  // Estados do Formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("SHOW");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("100");
  const [price, setPrice] = useState("50.00");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<EventStatus>("PUBLISHED");

  // Estados do Assistente de Catálogo
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogResults, setCatalogResults] = useState<CatalogItem[]>([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados de Envio
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== "ORGANIZER") {
      router.push("/login?redirect=/organizer/events/new");
    }
  }, [user, isHydrated, router]);

  const handleSearchCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogQuery.trim()) return;

    setIsSearchingCatalog(true);
    setHasSearched(true);
    try {
      const response = await catalogApi.search(catalogQuery.trim(), type);
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
    // Scroll suave até o formulário
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      await eventsApi.create({
        title,
        description,
        type,
        category,
        date: new Date(date).toISOString(),
        location,
        capacity: parseInt(capacity, 10),
        price: parseFloat(price),
        imageUrl: imageUrl.trim() || undefined,
        status,
      });

      router.push("/organizer/events");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro ao criar evento. Verifique os dados e tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Voltar */}
        <Link
          href="/organizer/events"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o Painel de Eventos
        </Link>

        {/* Cabeçalho */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Plus className="w-7 h-7 text-indigo-400" />
            Criar Novo Evento
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Cadastre os dados manualmente ou use nosso assistente para importar informações de filmes e shows.
          </p>
        </div>

        {/* Assistente de Catálogo Inteligente (TMDb / Ticketmaster) */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Assistente de Catálogo Externo (TMDb & Ticketmaster)</span>
          </div>
          <p className="text-xs text-zinc-400">
            Digite o nome de uma banda, festival ou filme (ex: <em>Coldplay, Batman, Rock in Rio, Avengers</em>) para auto-preencher imagem, sinopse e categoria.
          </p>

          <form onSubmit={handleSearchCatalog} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Ex: Coldplay, Metallica, Gladiador II..."
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="bg-zinc-950/80"
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
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/50 transition-all text-left group"
                >
                  {item.imageUrl ? (
                    <div className="relative w-14 h-18 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-18 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-600 flex-shrink-0">
                      <Film className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={item.type === "SHOW" ? "purple" : "default"}>
                        {item.type === "SHOW" ? "Show" : "Filme"}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.source}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{item.description}</p>
                    <button
                      type="button"
                      onClick={() => handleApplyCatalogItem(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 pt-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Usar estes dados
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasSearched && catalogResults.length === 0 && !isSearchingCatalog && (
            <p className="text-xs text-zinc-500 text-center py-2">
              Nenhum resultado externo encontrado para &quot;{catalogQuery}&quot;. Você pode preencher manualmente abaixo.
            </p>
          )}
        </div>

        {/* Formulário Principal de Criação */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Dados do Evento
          </h3>

          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tipo de Evento */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-300">Tipo de Evento</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("SHOW")}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold",
                    type === "SHOW"
                      ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm ring-1 ring-blue-500/40"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <Music className="w-4 h-4" />
                  Show / Concerto / Festival
                </button>
                <button
                  type="button"
                  onClick={() => setType("MOVIE")}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold",
                    type === "MOVIE"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-sm ring-1 ring-indigo-500/40"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  )}
                >
                  <Film className="w-4 h-4" />
                  Filme / Cinema
                </button>
              </div>
            </div>

            {/* Título */}
            <Input
              label="Título do Evento *"
              placeholder="Ex: Turnê Coldplay 2026 - Music of the Spheres"
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
                className="w-full p-3 text-sm bg-zinc-950/80 text-zinc-100 placeholder-zinc-500 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
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
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400"
                  )}
                >
                  Salvar como Rascunho
                </button>
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <Button type="submit" size="lg" variant="primary" isLoading={isLoading}>
                Publicar Evento e Abrir Vendas
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
