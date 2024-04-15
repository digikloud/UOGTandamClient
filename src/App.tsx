import React, { useEffect, useState, useMemo } from "react";
import Viewer from "./components/Viewer";
import "./App.css";
import { initializeViewer } from "./utils/viewerUtils";

const App = () => {
  const [isViewerInitialized, setIsViewerInitialized] = 
  useState<boolean>(false);;
  const [facilityList, setFacilityList] = useState<
    Autodesk.Tandem.DtFacility[]
  >([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>();
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    initializeViewer().then((data) => {
      function cb(acctoken:string) {
        setToken(acctoken);
      }

      data.getAccessToken(cb);
      setIsViewerInitialized(true);
    });
  }, []);

  useEffect(() => {
    if (facilityList.length > 0 && !selectedFacilityId) {
      const initialFacility = facilityList.find(
        (item) => item.settings.props["Identity Data"]["Building Name"] === "Adam Smith Business School"
      );
      if (initialFacility) {
        setSelectedFacilityId(initialFacility.twinId);
      }
    }
  }, [facilityList, selectedFacilityId]);

  const onAppInitialized = async (app: Autodesk.Tandem.DtApp) => {
    try {
      const result: any = await app.fetchFacilities();
      setFacilityList(result);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(()=>{
    const facility = facilityList.find((f) => f.twinId === selectedFacilityId);
    if (facility) {
      setSelectedFacility(facility);
    }
  })

  const facilityItems = useMemo(() => {
    return facilityList.map((item) => {
      let name = item.settings.props["Identity Data"]["Project Name"];
      if (name.length === 0) {
        name = item.settings.props["Identity Data"]["Building Name"];
      }
      setSelectedFacilityId(item.twinId)
      return (
        <option key={item.twinId} value={item.twinId}>
          {name}
        </option>
      );
    });
  }, [facilityList]);

  return (
    <React.Fragment>
      {/* <div className="header">
        <div className="header-icon"></div>
        <div className="header-title">Tandem</div>
      </div> */}
      <div className="main">
        {/* <div className="left">
          <select value={selectedFacilityId} onChange={(e) => setSelectedFacilityId(e.target.value)}>
            {facilityItems}
          </select>
          <button onClick={onLoad}>Load</button>
        </div> */}
        <div className="right">
          {isViewerInitialized && (
            <div className="viewer-container">
              <Viewer
                onAppInitialized={onAppInitialized}
                facility={selectedFacility}
                token={token}
              />
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default App;
