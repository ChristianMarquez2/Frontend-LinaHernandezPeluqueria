import React from "react";
import { ServicesProvider } from "../data/context/ServicesContext";
import { AppointmentsProvider } from "../data/context/AppointmentsContext";
import { RatingsProvider } from "../data/context/RatingsContext";
import { NotificationsProvider } from "../data/context/NotificationsContext";
import { ReportsProvider } from "../data/context/ReportsContext";

export function DataProvider({ children }: { children: React.ReactNode }) {
  return (
    <ServicesProvider>
      <AppointmentsProvider>
        <RatingsProvider>
          <NotificationsProvider>
            <ReportsProvider>
              {children}
            </ReportsProvider>
          </NotificationsProvider>
        </RatingsProvider>
      </AppointmentsProvider>
    </ServicesProvider>
  );
}