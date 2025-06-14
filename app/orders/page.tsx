"use client"

import { useState,useEffect } from "react"
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  FileText,
} from "lucide-react"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {toast } from "sonner"


interface Order {
  id: string        
    userId: string
    userName: string
    pickupDate: string
    pickupSlot: string
    deliveryDate: string
    deliverySlot: string
    status: string
    paymentStatus: string
    totalAmount: number
    serviceType: string
    address: string
}


const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
]

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  PICKED_UP: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order|null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
 const [orders,setOrders] = useState<Order[]>([])
 const [loading, setLoading] = useState(false)
  const itemsPerPage = 10


  useEffect(() => {
    const fetchOrders = async ()=>{
      try{
        setLoading(true);
        const response = await fetch("https://washamlaundryapi.onrender.com/orders",{
          method:"GET",
          headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          }
        })
        if(!response.ok){
          toast("failed to fetch users")
          throw new Error("failed to fetch users");
        }
        const data = await response.json();
        setOrders(data);
        toast("users fetched successfully");
        console.log("Fetched users:", data);
  
      }
      catch(error){
        console.log("Error fetching users:", error);
      }
      finally{
        setLoading(false);
      }
    };
   fetchOrders();
  },[setOrders]);


  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? order.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  // Paginate orders
  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

  const handleDeleteOrder = () => {
    setSelectedOrder(null)
  }

  const handleUpdateStatus = () => {
  }

 

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground">Manage your customer orders and their status.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="w-full md:w-[250px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter || "ALL"} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button>Add Order</Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Pickup Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ):currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                    <TableCell>{order.userName}</TableCell>
                    <TableCell>{order.serviceType.replace("_", " ")}</TableCell>
                    <TableCell>{formatDate(order.pickupDate)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"} variant="outline">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.paymentStatus === "PAID" ? "default" : "outline"}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Edit order", order.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem >
                            <Filter className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Order #{selectedOrder?.id.slice(-6)}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.id.slice(-6)}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Pickup Date
                  </p>
                  <p className="text-sm">{formatDate(selectedOrder.pickupDate)}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.pickupSlot}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Delivery Date
                  </p>
                  <p className="text-sm">{formatDate(selectedOrder.deliveryDate)}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.deliverySlot}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Delivery Address
                </p>
                <p className="text-sm">{selectedOrder.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Status
                  </p>
                  <Badge
                    className={statusColors[selectedOrder.status] || "bg-gray-100 text-gray-800"}
                    variant="outline"
                  >
                    {selectedOrder.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> Payment Status
                  </p>
                  <Badge variant={selectedOrder.paymentStatus === "PAID" ? "default" : "outline"}>
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Service Details</p>
                <div className="rounded-md border p-3">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm">{selectedOrder.serviceType.replace("_", " ")}</p>
                    <p className="text-sm font-medium">${selectedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Customer: {selectedOrder.userName}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOrderDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status for Order #{selectedOrder?.id.slice(-6)}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Status:</p>
              {selectedOrder && (
                <Badge className={statusColors[selectedOrder.status] || "bg-gray-100 text-gray-800"} variant="outline">
                  {selectedOrder.status.replace("_", " ")}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">New Status:</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
