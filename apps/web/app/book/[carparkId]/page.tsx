import { SidebarProvider, SidebarInset } from "../../../components/ui/sidebar";
import { Reservation } from "../Reservation";

export default function BookCarparkPage() {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "22rem",
          } as React.CSSProperties
        }
      >
        <div className="pointer-events-auto">
          <Reservation />
        </div>
        <SidebarInset></SidebarInset>
      </SidebarProvider>
    </>
  );
}
