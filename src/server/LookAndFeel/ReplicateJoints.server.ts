const ReplicatedStorage = game.GetService("ReplicatedStorage");

// Create a RemoteEvent to receive joint data from clients
const jointEvent = new Instance("RemoteEvent");
jointEvent.Name = "JointReplication";
jointEvent.Parent = ReplicatedStorage;

// Listen for joint updates from clients
jointEvent.OnServerEvent.Connect((player, ...args: unknown[]) => {
    const [rootJointC0, neckC0, rightHipC0, leftHipC0] = args as [CFrame, CFrame, CFrame, CFrame];
    const character = player.Character;
    if (!character) return;
    
    const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;
    const torso = character.FindFirstChild("Torso") as BasePart;
    if (!humanoidRootPart || !torso) return;
    
    const rootJoint = humanoidRootPart.FindFirstChild("RootJoint") as Motor6D;
    const neck = torso.FindFirstChild("Neck") as Motor6D;
    const rightHip = torso.FindFirstChild("Right Hip") as Motor6D;
    const leftHip = torso.FindFirstChild("Left Hip") as Motor6D;
    
    if (rootJoint) rootJoint.C0 = rootJointC0;
    if (neck) neck.C0 = neckC0;
    if (rightHip) rightHip.C0 = rightHipC0;
    if (leftHip) leftHip.C0 = leftHipC0;
});