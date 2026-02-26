import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { breedService } from "@/services/breedService"
import { cn } from "@/lib/utils"
import { Search, PawPrint, X, Check, ChevronDown, Loader2 } from "lucide-react"
import type { Breed } from "@/types/breed"

interface BreedSearchSelectProps {
  value: string
  onChange: (breedId: string) => void
  speciesTypeId?: string
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function BreedSearchSelect({
  value,
  onChange,
  speciesTypeId,
  disabled = false,
  placeholder = "Buscar raza...",
  className,
}: BreedSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch breeds based on search and species
  const { data: breeds = [], isLoading, isFetching } = useQuery({
    queryKey: ["breeds-search", speciesTypeId, debouncedSearch],
    queryFn: () => breedService.search({ 
      speciesTypeId,
      search: debouncedSearch, 
      limit: 30 
    }),
    enabled: isOpen && !!speciesTypeId,
    staleTime: 30000,
  })

  // Fetch selected breed details
  const { data: selectedBreed } = useQuery({
    queryKey: ["breed", value],
    queryFn: () => breedService.getOne(value),
    enabled: !!value,
    staleTime: 60000,
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Reset highlighted index when breeds change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [breeds])

  // Reset value when species changes
  useEffect(() => {
    if (speciesTypeId && value && selectedBreed && selectedBreed.speciesTypeId !== speciesTypeId) {
      onChange("")
    }
  }, [speciesTypeId])

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [highlightedIndex, isOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        if (!disabled && speciesTypeId) {
          setIsOpen(true)
        }
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => 
          prev < breeds.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case "Enter":
        e.preventDefault()
        if (breeds[highlightedIndex]) {
          handleSelect(breeds[highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        break
      case "Tab":
        setIsOpen(false)
        break
    }
  }, [isOpen, breeds, highlightedIndex, disabled, speciesTypeId])

  const handleSelect = (breed: Breed) => {
    onChange(breed.id)
    setSearchTerm("")
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    setSearchTerm("")
  }

  const handleInputFocus = () => {
    if (!disabled && speciesTypeId) {
      setIsOpen(true)
    }
  }

  const isSearching = isLoading || isFetching
  const isDisabledBySpecies = !speciesTypeId

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected breed display / Search input */}
      <div
        className={cn(
          "flex items-center w-full rounded-md border border-input bg-background text-sm ring-offset-background transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          (disabled || isDisabledBySpecies) && "cursor-not-allowed opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {/* Icon */}
        <div className="flex items-center justify-center pl-3 text-muted-foreground">
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        {/* Input area */}
        <div className="flex-1 relative">
          {value && selectedBreed && !isOpen ? (
            // Show selected breed
            <div 
              className="flex items-center gap-2 px-3 py-2 cursor-pointer min-h-[40px]"
              onClick={() => !disabled && !isDisabledBySpecies && setIsOpen(true)}
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">{selectedBreed.name}</div>
                {selectedBreed.speciesType && (
                  <div className="text-xs text-muted-foreground">
                    {selectedBreed.speciesType.name}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Show search input
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={
                isDisabledBySpecies 
                  ? "Selecciona una especie primero" 
                  : (value && selectedBreed ? selectedBreed.name : placeholder)
              }
              disabled={disabled || isDisabledBySpecies}
              className={cn(
                "w-full px-3 py-2 bg-transparent outline-none min-h-[40px]",
                "placeholder:text-muted-foreground disabled:cursor-not-allowed"
              )}
            />
          )}
        </div>

        {/* Clear / Dropdown buttons */}
        <div className="flex items-center gap-1 pr-2">
          {value && !disabled && !isDisabledBySpecies && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && !isDisabledBySpecies && setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            disabled={disabled || isDisabledBySpecies}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && speciesTypeId && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {/* Results list */}
          <ul
            ref={listRef}
            className="max-h-[250px] overflow-y-auto py-1"
            role="listbox"
          >
            {isSearching && breeds.length === 0 ? (
              <li className="px-4 py-6 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <span>Buscando razas...</span>
              </li>
            ) : breeds.length === 0 ? (
              <li className="px-4 py-6 text-center text-muted-foreground">
                <PawPrint className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No se encontraron razas</p>
                <p className="text-sm mt-1">
                  {searchTerm 
                    ? `No hay resultados para "${searchTerm}"`
                    : "Escribe para buscar razas"
                  }
                </p>
              </li>
            ) : (
              breeds.map((breed, index) => (
                <li
                  key={breed.id}
                  role="option"
                  aria-selected={breed.id === value}
                  onClick={() => handleSelect(breed)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "px-3 py-2 cursor-pointer transition-colors",
                    index === highlightedIndex && "bg-accent",
                    breed.id === value && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-sm font-medium text-orange-700">
                      {breed.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Breed info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {breed.name}
                        </span>
                        {breed.id === value && (
                          <Check className="flex-shrink-0 h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>
                      {breed.description && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {breed.description}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* Footer with count */}
          {breeds.length > 0 && (
            <div className="px-3 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground">
              {breeds.length} razas encontradas
              {searchTerm && ` • Buscando: "${searchTerm}"`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
