import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { clientService } from "@/services/clientService"
import { cn } from "@/lib/utils"
import { Search, User, Phone, Mail, X, Check, ChevronDown, Loader2 } from "lucide-react"
import type { Client } from "@/types/client"

interface ClientSearchSelectProps {
  value: string
  onChange: (clientId: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ClientSearchSelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Buscar cliente por nombre, RUT o teléfono...",
  className,
}: ClientSearchSelectProps) {
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

  // Fetch clients based on search
  const { data: clientsData, isLoading, isFetching } = useQuery({
    queryKey: ["clients-search", debouncedSearch],
    queryFn: () => clientService.getAll({ 
      search: debouncedSearch, 
      limit: 15 
    }),
    enabled: isOpen,
    staleTime: 30000,
  })

  // Fetch selected client details
  const { data: selectedClient } = useQuery({
    queryKey: ["client", value],
    queryFn: () => clientService.getOne(value),
    enabled: !!value,
    staleTime: 60000,
  })

  const clients = clientsData?.data || []

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

  // Reset highlighted index when clients change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [clients])

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
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => 
          prev < clients.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case "Enter":
        e.preventDefault()
        if (clients[highlightedIndex]) {
          handleSelect(clients[highlightedIndex])
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
  }, [isOpen, clients, highlightedIndex])

  const handleSelect = (client: Client) => {
    onChange(client.id)
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
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const formatClientInfo = (client: Client) => {
    const parts = []
    if (client.rut) parts.push(client.rut)
    if (client.phone) parts.push(client.phone)
    return parts.join(" • ")
  }

  const isSearching = isLoading || isFetching

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected client display / Search input */}
      <div
        className={cn(
          "flex items-center w-full rounded-md border border-input bg-background text-sm ring-offset-background transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
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
          {value && selectedClient && !isOpen ? (
            // Show selected client
            <div 
              className="flex items-center gap-2 px-3 py-2 cursor-pointer min-h-[40px]"
              onClick={() => !disabled && setIsOpen(true)}
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">{selectedClient.name}</div>
                {(selectedClient.rut || selectedClient.phone) && (
                  <div className="text-xs text-muted-foreground">
                    {formatClientInfo(selectedClient)}
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
              placeholder={value && selectedClient ? selectedClient.name : placeholder}
              disabled={disabled}
              className={cn(
                "w-full px-3 py-2 bg-transparent outline-none min-h-[40px]",
                "placeholder:text-muted-foreground disabled:cursor-not-allowed"
              )}
            />
          )}
        </div>

        {/* Clear / Dropdown buttons */}
        <div className="flex items-center gap-1 pr-2">
          {value && !disabled && (
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
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            disabled={disabled}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {/* Results list */}
          <ul
            ref={listRef}
            className="max-h-[300px] overflow-y-auto py-1"
            role="listbox"
          >
            {isSearching && clients.length === 0 ? (
              <li className="px-4 py-8 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <span>Buscando clientes...</span>
              </li>
            ) : clients.length === 0 ? (
              <li className="px-4 py-8 text-center text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No se encontraron clientes</p>
                <p className="text-sm mt-1">
                  {searchTerm 
                    ? `No hay resultados para "${searchTerm}"`
                    : "Escribe para buscar clientes"
                  }
                </p>
              </li>
            ) : (
              clients.map((client, index) => (
                <li
                  key={client.id}
                  role="option"
                  aria-selected={client.id === value}
                  onClick={() => handleSelect(client)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "px-3 py-2 cursor-pointer transition-colors",
                    index === highlightedIndex && "bg-accent",
                    client.id === value && "bg-primary/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                      client.clientType === "VIP" 
                        ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300" 
                        : "bg-primary/10 text-primary"
                    )}>
                      {client.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Client info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {client.name}
                        </span>
                        {client.clientType === "VIP" && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                            VIP
                          </span>
                        )}
                        {client.id === value && (
                          <Check className="flex-shrink-0 h-4 w-4 text-primary ml-auto" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {client.rut && (
                          <span className="font-mono">{client.rut}</span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                        {client.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                      </div>

                      {client.address && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {client.address}
                          {client.commune && `, ${client.commune}`}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* Footer with count */}
          {clientsData && clientsData.total > 0 && (
            <div className="px-3 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground">
              Mostrando {clients.length} de {clientsData.total} clientes
              {searchTerm && ` • Buscando: "${searchTerm}"`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
