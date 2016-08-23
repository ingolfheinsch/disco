﻿namespace Iris.Tests

open System
open System.IO
open System.Linq
open System.Threading
open Fuchu
open Fuchu.Test
open Iris.Core
open LibGit2Sharp

[<AutoOpen>]
module ProjectTests =
  let signature =
    new Signature("Karsten Gebbert", "karsten@nsynk.de", new DateTimeOffset(DateTime.Now))
  //   _                    _    ______
  //  | |    ___   __ _  __| |  / / ___|  __ ___   _____
  //  | |   / _ \ / _` |/ _` | / /\___ \ / _` \ \ / / _ \
  //  | |__| (_) | (_| | (_| |/ /  ___) | (_| |\ V /  __/
  //  |_____\___/ \__,_|\__,_/_/  |____/ \__,_| \_/ \___|ed
  //
  let loadSaveTest =
    testCase "Save/Load Project should render equal project values" <|
      fun _ ->
        let name = "test1"
        let path = Path.Combine(Directory.GetCurrentDirectory(),"tmp", name)

        let (commit, project) =
          { Project.Create name with Path = Some(path) }
          |> save signature "Initial project save."
          |> Option.get

        let result = Project.Load(path + (sprintf "/%s.iris" name))

        expect "Projects should be loaded" true Option.isSome result

        let loaded = Option.get result

        expect "Projects should be equal" true ((=) project) loaded

  //    ____          _                  _             _
  //   / ___|   _ ___| |_ ___  _ __ ___ (_)_______  __| |
  //  | |  | | | / __| __/ _ \| '_ ` _ \| |_  / _ \/ _` |
  //  | |__| |_| \__ \ || (_) | | | | | | |/ /  __/ (_| |
  //   \____\__,_|___/\__\___/|_| |_| |_|_/___\___|\__,_| load/saved
  //
  let testCustomizedCfg =
    testCase "Save/Load of Project with customized configs should render structurally equal values" <|
      fun _ ->
        let name = "test2"
        let path = Path.Combine(Directory.GetCurrentDirectory(),"tmp", name)

        let engineCfg = RaftConfig.Default

        let vvvvCfg =
          { VvvvConfig.Default with
              Executables =
                [{ Executable = "/pth/to/nowhere"
                 ; Version    = "0.0.0.0.0.0.1"
                 ; Required   = true }
                 { Executable = "/antoher/path"
                 ; Version    = "1.2.34.4"
                 ; Required   = false }
                ]
            }

        let portCfg =
          { PortConfig.Default with
              WebSocket = 666u }

        let display1 =
          { Id        = Id.Create()
          ; Name      = "Nice Display"
          ; Size      = Rect (1280,1080)
          ; Signals   =
              [{ Size     = Rect       (500,500)
               ; Position = Coordinate (0,0) }
               { Size     = Rect       (800,800)
               ; Position = Coordinate (29, 13) }]
          ; RegionMap =
            {
              SrcViewportId = Id.Create()
              Regions =
                [{ Id             = Id.Create()
                 ; Name           = "A Cool Region"
                 ; SrcPosition    = Coordinate (0,0)
                 ; SrcSize        = Rect       (50,50)
                 ; OutputPosition = Coordinate (50,50)
                 ; OutputSize     = Rect       (100,100)
                 };
                 { Id             = Id.Create()
                 ; Name           = "Another Cool Region"
                 ; SrcPosition    = Coordinate (8,67)
                 ; SrcSize        = Rect       (588,5130)
                 ; OutputPosition = Coordinate (10,5300)
                 ; OutputSize     = Rect       (800,900)
                 }]
            }
          }

        let display2 =
          { Id        = Id.Create()
          ; Name      = "Cool Display"
          ; Size      = Rect (180,12080)
          ; Signals   =
              [{ Size     = Rect (800,200)
               ; Position = Coordinate (3,8)
               };
               { Size     = Rect (1800,8800)
               ; Position = Coordinate (2900, 130)
               }]
          ; RegionMap =
            {
              SrcViewportId = Id.Create();
              Regions =
                [{ Id             = Id.Create()
                 ; Name           = "One Region"
                 ; SrcPosition    = Coordinate (0,8)
                 ; SrcSize        = Rect       (50,52)
                 ; OutputPosition = Coordinate (53,50)
                 ; OutputSize     = Rect       (103,800)
                 };
                 { Id             = Id.Create()
                 ; Name           = "Premium Region"
                 ; SrcPosition    = Coordinate (8333,897)
                 ; SrcSize        = Rect       (83,510)
                 ; OutputPosition = Coordinate (1580,50)
                 ; OutputSize     = Rect       (1800,890)
                 }]
            }
          }

        let viewPort1 =
          { Id             = Id.Create()
          ; Name           = "One fine viewport"
          ; Position       = Coordinate (22,22)
          ; Size           = Rect       (666,666)
          ; OutputPosition = Coordinate (0,0)
          ; OutputSize     = Rect       (98327,121)
          ; Overlap        = Rect       (0,0)
          ; Description    = "Its better than bad, its good."
          }

        let viewPort2 =
          { Id             = Id.Create()
          ; Name           = "Another fine viewport"
          ; Position       = Coordinate (82,2)
          ; Size           = Rect       (466,86)
          ; OutputPosition = Coordinate (12310,80)
          ; OutputSize     = Rect       (98,89121)
          ; Overlap        = Rect       (0,33)
          ; Description    = "Its awesome actually"
          }

        let task1 =
          { Id             = Id.Create()
          ; Description    = "A very important task, indeed."
          ; DisplayId      = Id.Create()
          ; AudioStream    = "hm"
          ; Arguments      = [("key", "to you heart")]
          }

        let task2 =
          { Id             = Id.Create()
          ; Description    = "yay, its another task"
          ; DisplayId      = Id.Create()
          ; AudioStream    = "hoho"
          ; Arguments      = [("mykey", "to my heart")]
          }

        let nodeA =
          { MemberId = Id.Create()
          ; HostName = "moomoo"
          ; IpAddr   = IpAddress.Parse "182.123.18.2"
          ; TaskId   = Id.Create() |> Some
          ; Status   = Running
          ; Port     = 1234
          }

        let nodeB =
          { MemberId = Id.Create()
          ; HostName = "taataaa"
          ; IpAddr   = IpAddress.Parse "118.223.8.12"
          ; TaskId   = Id.Create() |> Some
          ; Status   = Paused
          ; Port     = 1234
          }

        let groupA =
          { Name    = "Group A"
          ; Members = [ Id.Create() ]
          }

        let groupB =
          { Name    = "Group B"
          ; Members = [ Id.Create() ]
          }

        let cluster =
          { Name   = "A mighty cool cluster"
          ; Nodes  = [ nodeA;  nodeB  ]
          ; Groups = [ groupA; groupB ]
          }

        let project =
          let prj = Project.Create name
          { prj with
              Path = Some(path)
              Config =
                { prj.Config with
                    RaftConfig    = engineCfg
                    PortConfig    = portCfg
                    VvvvConfig    = vvvvCfg
                    ViewPorts     = [ viewPort1; viewPort2 ]
                    Displays      = [ display1;  display2  ]
                    Tasks         = [ task1;     task2     ]
                    ClusterConfig = cluster } }

        let (_,saved) =
          project.Save(signature, "Initial project save.")
          |> Option.get

        let loaded =
          Project.Load(path + sprintf "/%s.iris" name)
          |> Option.get

        // the only difference will be the automatically assigned timestamp
        expect "CreatedOn should be structurally equal"  true ((=) loaded.CreatedOn) saved.CreatedOn
        expect "LastSaved should be structurally equal"  true ((=) loaded.LastSaved) saved.LastSaved
        expect "VVVVConfig should be structurally equal" true ((=) loaded.Config.VvvvConfig) saved.Config.VvvvConfig
        expect "RaftCofnig should be structurally equal" true ((=) loaded.Config.RaftConfig) saved.Config.RaftConfig
        expect "ViewPorts should be structurally equal"  true ((=) loaded.Config.ViewPorts) saved.Config.ViewPorts
        expect "Timing should be structurally equal"     true ((=) loaded.Config.TimingConfig) saved.Config.TimingConfig
        expect "Displays should be structurally equal"   true ((=) loaded.Config.Displays) saved.Config.Displays
        expect "Tasks should be structurally equal"      true ((=) loaded.Config.Tasks) saved.Config.Tasks
        expect "Cluster should be structurally equal"    true ((=) loaded.Config.ClusterConfig) saved.Config.ClusterConfig
        expect "Projects should be structurally equal"   true ((=) loaded) saved

  //    ____ _ _
  //   / ___(_) |_
  //  | |  _| | __|
  //  | |_| | | |_
  //   \____|_|\__| initialzation
  //
  let saveInitsGit =
    testCase "Saved Project should be a git repository with yaml file." <|
      fun _ ->
        let name = "test3"
        let path = Path.Combine(Directory.GetCurrentDirectory(),"tmp", name)

        if Directory.Exists path
        then Directory.Delete(path, true) |> ignore

        let project =
          { Project.Create name with Path = Some(path) }
          |> save signature "Initial commit."

        let loaded =
          Path.Combine(path, sprintf "%s.iris" name)
          |> Project.Load
          |> Option.get

        expect "Projects should be a folder"         true  Directory.Exists path
        expect "Projects should be a git repo"       true  Directory.Exists (path + "/.git")
        expect "Projects should have project yml"    true  File.Exists (path + "/" + name + ".iris")
        expect "Projects should have repo"           true  (repository >> Option.isSome) loaded
        expect "Projects should not be dirty"        false (repository >> Option.get >> isDirty) loaded
        expect "Projects should have initial commit" 1     (repository >> Option.get >> commitCount) loaded

  //    ____                          _ _
  //   / ___|___  _ __ ___  _ __ ___ (_) |_ ___
  //  | |   / _ \| '_ ` _ \| '_ ` _ \| | __/ __|
  //  | |__| (_) | | | | | | | | | | | | |_\__ \
  //   \____\___/|_| |_| |_|_| |_| |_|_|\__|___/ per save
  //
  let savesMultipleCommits =
    testCase "Saving project should contain multiple commits" <|
      fun _ ->
        let name = "test4"
        let author1 = "karsten"

        let path = Path.Combine(Directory.GetCurrentDirectory(),"tmp", name)

        if Directory.Exists path then
          Directory.Delete(path, true) |> ignore

        let msg1 = "Commit 1"

        let (commit1, project) =
          { Project.Create name with
              Path = Some(path)
              Author = Some(author1) }
          |> save signature msg1
          |> Option.get

        Path.Combine(path, sprintf "%s.iris" name)
        |> Project.Load
        |> Option.get
        |> fun p ->
            let repo = repository p |> Option.get
            let c =  commits repo |> elementAt 0
            expect "Authors should be equal"                true ((Option.get >> (=)) p.Author) author1
            expect "Project should have one initial commit" true ((=) (commitCount repo)) 1
            expect "Project should have commit message"     true ((=) c.MessageShort) msg1

        let author2 = "ingolf"
        let msg2 = "Commit 2"

        let (commit2, project) =
          { project with Author = Some author2 }
          |> save signature msg2
          |> Option.get

        Path.Combine(path, sprintf "%s.iris" name)
        |> Project.Load
        |> Option.get
        |> fun p ->
            let repo = repository p |> Option.get
            let cs = commits repo
            let c1 = elementAt 0 cs
            let c2 = elementAt 1 cs
            expect "Authors should be equal"                    true ((=) (Option.get p.Author)) author2
            expect "Projects should two commits"                true ((=) (commitCount repo)) 2
            expect "Project should have current commit message" true ((=) c1.MessageShort) msg2
            expect "Project should have old commit message"     true ((=) c2.MessageShort) msg1

        let msg3 = "Commit 3"
        let author3 = "eno"

        let (commit3, project) =
           { project with Author = Some author3 }
           |> save signature msg3
           |> Option.get

        Path.Combine(path, sprintf "%s.iris" name)
        |> Project.Load
        |> Option.get
        |> fun p ->
            let repo = repository p |> Option.get
            let cs = commits repo
            let c1 = elementAt 0 cs
            let c2 = elementAt 1 cs
            let c3 = elementAt 2 cs
            expect "Authors should be equal"                    true ((=) (Option.get p.Author)) author3
            expect "Projects should have three commits"         true ((=) (commitCount repo)) 3
            expect "Project should have current commit message" true ((=) c1.MessageShort) msg3
            expect "Project should have old commit message"     true ((=) c2.MessageShort) msg2
            expect "Project should have oldest commit message"  true ((=) c3.MessageShort) msg1

  // For tests async stuff:
  //
  // let testTests =
  //   testCase "making a case" <| (timeout 1000
  //     (fun _ ->
  //       Thread.Sleep(900)
  //       failtest "nop"))

  [<Tests>]
  let projectTests =
    testList "Load/Save tests" [
        loadSaveTest
        testCustomizedCfg
        saveInitsGit
        savesMultipleCommits
      ]
